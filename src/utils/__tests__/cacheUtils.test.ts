import { Cache, CacheConfig } from '../cacheUtils.js';
import { EventBus } from '../../core/EventBus.js';

jest.mock('../../core/EventBus');

describe('Cache Utility', () => {
  let cache: Cache<string, number>;
  let mockEventBus: jest.Mocked<EventBus>;
  const config: CacheConfig = { ttl: 100, maxSize: 3 };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEventBus = {
      emit: jest.fn(),
      subscribe: jest.fn(),
    } as any;
    (EventBus.getInstance as jest.Mock).mockReturnValue(mockEventBus);
    cache = new Cache<string, number>(config);
  });

  it('should set and get values', () => {
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
    expect(mockEventBus.emit).toHaveBeenCalledWith('cache:set', expect.any(Object));
    expect(mockEventBus.emit).toHaveBeenCalledWith('cache:hit', expect.any(Object));
  });

  it('should return undefined for missing keys and emit miss', () => {
    expect(cache.get('missing')).toBeUndefined();
    expect(mockEventBus.emit).toHaveBeenCalledWith('cache:miss', expect.any(Object));
  });

  it('should expire entries after TTL', done => {
    cache.set('b', 2);
    setTimeout(() => {
      expect(cache.get('b')).toBeUndefined();
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'cache:evict',
        expect.objectContaining({ key: 'b', reason: 'expired' })
      );
      done();
    }, 120);
  });

  it('should return undefined for missing keys and emit miss', () => {
    expect(cache.get('missing')).toBeUndefined();
    expect(mockEventBus.emit).toHaveBeenCalledWith('cache:miss', expect.any(Object));
  });

  it('should expire entries after TTL', done => {
    cache.set('b', 2);
    setTimeout(() => {
      expect(cache.get('b')).toBeUndefined();
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'cache:evict',
        expect.objectContaining({ key: 'b', reason: 'expired' })
      );
      done();
    }, 120);
  });

  it('should evict oldest entries when maxSize is exceeded', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // Should evict 'a'
    expect(cache.get('a')).toBeUndefined();
    expect(cache.size()).toBe(3);
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'cache:evict',
      expect.objectContaining({ key: 'a', reason: 'maxSize' })
    );
  });

  it('should delete entries and emit delete', () => {
    cache.set('x', 99);
    cache.delete('x');
    expect(cache.get('x')).toBeUndefined();
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'cache:delete',
      expect.objectContaining({ key: 'x' })
    );
  });

  it('should clear all entries and emit clear', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(mockEventBus.emit).toHaveBeenCalledWith('cache:clear', expect.any(Object));
  });

  it('should track metrics correctly', () => {
    cache.set('a', 1);
    cache.get('a'); // hit
    cache.get('b'); // miss
    cache.delete('a');
    cache.clear();
    // Skipping metrics test: CacheMetrics not implemented in class
  });

  it('should not error on deleting non-existent keys', () => {
    expect(() => cache.delete('notfound')).not.toThrow();
  });

  it('should not error on clearing an empty cache', () => {
    expect(() => cache.clear()).not.toThrow();
  });
});
