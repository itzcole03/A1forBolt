// A1Betting Progressive Web App Service Worker
// Phase 4: Advanced PWA with offline capabilities and native app experience

const CACHE_NAME = "a1betting-v1.0.0";
const STATIC_CACHE = "a1betting-static-v1.0.0";
const DYNAMIC_CACHE = "a1betting-dynamic-v1.0.0";
const API_CACHE = "a1betting-api-v1.0.0";

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
  CACHE_ONLY: "cache-only",
};

// Resources to cache immediately
const STATIC_ASSETS = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/offline.html",
];

// API endpoints to cache
const API_ENDPOINTS = [
  "/api/opportunities",
  "/api/predictions",
  "/api/portfolio",
  "/api/performance",
  "/api/models",
];

// Routes that should work offline
const OFFLINE_ROUTES = [
  "/",
  "/dashboard",
  "/analytics",
  "/portfolio",
  "/settings",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      }),

      // Cache offline page
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.add("/offline.html");
      }),
    ]).then(() => {
      console.log("[SW] Installation complete");
      // Skip waiting to activate immediately
      return self.skipWaiting();
    }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName.startsWith("a1betting-") &&
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE
              );
            })
            .map((cacheName) => {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }),
        );
      }),

      // Take control of all pages immediately
      self.clients.claim(),
    ]).then(() => {
      console.log("[SW] Activation complete");
    }),
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different request types
  if (request.method === "GET") {
    if (isStaticAsset(request)) {
      event.respondWith(handleStaticAsset(request));
    } else if (isAPIRequest(request)) {
      event.respondWith(handleAPIRequest(request));
    } else if (isPageRequest(request)) {
      event.respondWith(handlePageRequest(request));
    } else {
      event.respondWith(handleDynamicRequest(request));
    }
  }
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "background-sync-bets") {
    event.waitUntil(syncOfflineBets());
  } else if (event.tag === "background-sync-analytics") {
    event.waitUntil(syncAnalyticsData());
  }
});

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  const options = {
    body: "New betting opportunity available!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/icons/checkmark.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/xmark.png",
      },
    ],
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(self.registration.showNotification("A1Betting", options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/opportunities"));
  } else if (event.action === "close") {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      }),
    );
  }
});

// Helper functions
function isStaticAsset(request) {
  return (
    request.url.includes("/static/") ||
    request.url.includes(".js") ||
    request.url.includes(".css") ||
    request.url.includes(".png") ||
    request.url.includes(".jpg") ||
    request.url.includes(".svg") ||
    request.url.includes(".ico")
  );
}

function isAPIRequest(request) {
  return request.url.includes("/api/");
}

function isPageRequest(request) {
  return request.headers.get("accept").includes("text/html");
}

// Cache-first strategy for static assets
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Return cached version and update in background
      updateCacheInBackground(request, cache);
      return cachedResponse;
    }

    // If not in cache, fetch and cache
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log("[SW] Static asset fetch failed:", error);
    return new Response("Asset not available offline", { status: 503 });
  }
}

// Network-first strategy for API requests with offline fallback
async function handleAPIRequest(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log("[SW] API request failed, trying cache:", error);

    // Try to serve from cache
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline data if available
    return generateOfflineAPIResponse(request);
  }
}

// Stale-while-revalidate for pages
async function handlePageRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    // Return cached version immediately
    if (cachedResponse) {
      // Update cache in background
      updateCacheInBackground(request, cache);
      return cachedResponse;
    }

    // If not cached, fetch and cache
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log("[SW] Page request failed:", error);

    // Try to serve from cache
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match("/offline.html");
  }
}

// Generic dynamic content handler
async function handleDynamicRequest(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    return cache.match(request) || caches.match("/offline.html");
  }
}

// Background cache update
async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
  } catch (error) {
    console.log("[SW] Background update failed:", error);
  }
}

// Generate offline API responses
function generateOfflineAPIResponse(request) {
  const url = new URL(request.url);

  // Mock data for different endpoints
  const offlineData = {
    "/api/opportunities": {
      opportunities: [],
      message: "Offline mode - cached data not available",
      timestamp: Date.now(),
    },
    "/api/predictions": {
      predictions: [],
      message: "Offline mode - predictions require internet connection",
      timestamp: Date.now(),
    },
    "/api/portfolio": {
      positions: [],
      totalValue: 0,
      message: "Offline mode - portfolio data may be outdated",
      timestamp: Date.now(),
    },
  };

  const data = offlineData[url.pathname] || {
    message: "Service temporarily unavailable",
    offline: true,
    timestamp: Date.now(),
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}

// Sync offline bets when connection is restored
async function syncOfflineBets() {
  try {
    console.log("[SW] Syncing offline bets...");

    // Get offline bets from IndexedDB
    const offlineBets = await getOfflineBets();

    for (const bet of offlineBets) {
      try {
        const response = await fetch("/api/bets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bet),
        });

        if (response.ok) {
          await removeOfflineBet(bet.id);
          console.log("[SW] Bet synced successfully:", bet.id);
        }
      } catch (error) {
        console.log("[SW] Failed to sync bet:", bet.id, error);
      }
    }
  } catch (error) {
    console.log("[SW] Sync failed:", error);
  }
}

// Sync analytics data
async function syncAnalyticsData() {
  try {
    console.log("[SW] Syncing analytics data...");

    // Implementation would depend on your analytics strategy
    const response = await fetch("/api/analytics/sync", {
      method: "POST",
    });

    if (response.ok) {
      console.log("[SW] Analytics synced successfully");
    }
  } catch (error) {
    console.log("[SW] Analytics sync failed:", error);
  }
}

// IndexedDB operations for offline storage
async function getOfflineBets() {
  // Implementation would use IndexedDB to store offline bets
  return [];
}

async function removeOfflineBet(betId) {
  // Implementation would remove bet from IndexedDB
  console.log("[SW] Removing offline bet:", betId);
}

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  } else if (event.data.type === "CACHE_ANALYTICS") {
    cacheAnalyticsData(event.data.data);
  }
});

// Cache analytics data for offline viewing
async function cacheAnalyticsData(data) {
  try {
    const cache = await caches.open(API_CACHE);
    const response = new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
    await cache.put("/api/analytics/cached", response);
    console.log("[SW] Analytics data cached");
  } catch (error) {
    console.log("[SW] Failed to cache analytics data:", error);
  }
}

console.log("[SW] Service Worker script loaded");
