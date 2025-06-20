

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

export class Cache<K, V> {
  private cache: Map<K, CacheEntry<V>>;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.config = config;
  }

  set(key: K, value: V): void {
    // Clean up if we're at max size
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        this.cache.delete(key);
      }
    }

    // If still over max size, remove oldest entries
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const entriesToRemove = entries.slice(0, entries.length - this.config.maxSize);
      for (const [key] of entriesToRemove) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Create a decorator for caching async method results
export function cached(ttl: number, maxSize?: number) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = new Cache<string, unknown>({ ttl, maxSize });

    descriptor.value = async function (...args: unknown[]) {
      const key = `${propertyKey}:${JSON.stringify(args)}`;
      const cachedResult = cache.get(key);

      if (cachedResult !== undefined) {
        return cachedResult;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(key, result);
      return result;
    };

    return descriptor;
  };
} 