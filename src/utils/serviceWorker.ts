

/// <reference lib="webworker" />

// Polyfill for SyncEvent if not present in the TypeScript lib
// Remove this if you upgrade TypeScript and the error disappears
declare interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
  readonly lastChance: boolean;
}


const CACHE_NAME = 'prizepicks-cache-v1';
const API_CACHE_NAME = 'prizepicks-api-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

const API_ROUTES = [
  'api.prizepicks.com/projections',
  'api.prizepicks.com/games'
];

(self as unknown as ServiceWorkerGlobalScope).addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(API_CACHE_NAME)
    ])
  );
});

(self as unknown as ServiceWorkerGlobalScope).addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

(self as unknown as ServiceWorkerGlobalScope).addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  // Handle API requests
  if (API_ROUTES.some(route => url.href.includes(route))) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(response => {
        // Cache new static assets
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

async function handleApiRequest(request: Request): Promise<Response> {
  try {
    // Try network first
    const response = await fetch(request);
    if (response.status === 200) {
      const responseClone = response.clone();
      const cache = await caches.open(API_CACHE_NAME);
      await cache.put(request, responseClone);
      return response;
    }
    throw new Error('Network response was not ok');
  } catch (error) {
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle background sync for failed requests
(self as unknown as ServiceWorkerGlobalScope).addEventListener('sync', ((event: Event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === 'sync-projections') {
    syncEvent.waitUntil(syncProjections());
  }
}) as EventListener);

async function syncProjections() {
  const failedRequests = await getFailedRequests();
  await Promise.all(
    failedRequests.map(async (request) => {
      try {
        await fetch(request);
        await removeFailedRequest(request);
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    })
  );
}

// IndexedDB utilities for failed requests
const dbName = 'prizepicks-offline';
const storeName = 'failed-requests';

// NOTE: If you store requests as POJOs, update this type to Promise<StoredRequest[]> and rehydrate as needed.
async function getFailedRequests(): Promise<Request[]> {
  const db = await openDB();
  const store = db.transaction(storeName).objectStore(storeName);
  return store.getAll() as unknown as Request[];
}

async function removeFailedRequest(request: Request) {
  const db = await openDB();
  const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
  await store.delete(request.url);
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      // Type guard: event.target may be null, and must be an IDBOpenDBRequest to access .result
      const target = event.target;
      if (target && 'result' in target) {
        const db = (target as IDBOpenDBRequest).result;
        db.createObjectStore(storeName, { keyPath: 'url' });
      }
    };
  });
}