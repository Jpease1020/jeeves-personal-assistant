// Service Worker for PWA functionality
const CACHE_NAME = 'personal-assistant-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const CACHE_FILES = [
    '/',
    '/offline.html',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching essential files');
                return cache.addAll(CACHE_FILES);
            })
            .then(() => {
                console.log('✅ Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - handle offline functionality
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleAPIRequest(request));
        return;
    }

    // Handle static assets
    if (request.destination === 'image' || request.destination === 'script' || request.destination === 'style') {
        event.respondWith(handleStaticAsset(request));
        return;
    }

    // Handle navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request));
        return;
    }

    // Default: try network first, fallback to cache
    event.respondWith(
        fetch(request)
            .catch(() => caches.match(request))
    );
});

// Handle API requests with offline support
async function handleAPIRequest(request) {
    try {
        // Try network first
        const response = await fetch(request);

        // Cache successful responses for offline use
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('🌐 Service Worker: Network failed, trying cache');

        // Try cache for offline support
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline response for API calls
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'You are offline. Some features may be limited.',
                offline: true
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle static assets
async function handleStaticAsset(request) {
    // Try cache first for better performance
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    // If not in cache, fetch from network
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('🌐 Service Worker: Failed to fetch static asset', request.url);
        return new Response('Asset not available offline', { status: 404 });
    }
}

// Handle navigation requests
async function handleNavigation(request) {
    try {
        // Try network first
        const response = await fetch(request);
        return response;
    } catch (error) {
        console.log('🌐 Service Worker: Navigation failed, showing offline page');

        // Show offline page
        const offlineResponse = await caches.match(OFFLINE_URL);
        if (offlineResponse) {
            return offlineResponse;
        }

        // Fallback offline page
        return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Personal Assistant</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #1a1a1a;
              color: white;
              text-align: center;
              padding: 20px;
            }
            .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { margin-bottom: 1rem; }
            p { margin-bottom: 2rem; opacity: 0.8; }
            .retry-btn {
              background: #6366f1;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="offline-icon">📱</div>
          <h1>You're Offline</h1>
          <p>Don't worry! Your personal assistant is still working.</p>
          <p>Some features may be limited, but you can still:</p>
          <ul style="text-align: left; max-width: 300px;">
            <li>✅ View cached habits</li>
            <li>✅ Access morning routine</li>
            <li>✅ Use offline features</li>
          </ul>
          <button class="retry-btn" onclick="window.location.reload()">
            Try Again
          </button>
        </body>
      </html>
    `, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync triggered');

    if (event.tag === 'habit-sync') {
        event.waitUntil(syncHabits());
    }

    if (event.tag === 'routine-sync') {
        event.waitUntil(syncRoutine());
    }
});

// Sync habits when back online
async function syncHabits() {
    try {
        console.log('🔄 Service Worker: Syncing habits...');

        // Get offline habit logs from IndexedDB
        const offlineHabits = await getOfflineHabits();

        for (const habit of offlineHabits) {
            try {
                await fetch('/api/habits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(habit)
                });

                // Remove from offline storage after successful sync
                await removeOfflineHabit(habit.id);
            } catch (error) {
                console.error('Failed to sync habit:', error);
            }
        }

        console.log('✅ Service Worker: Habits synced');
    } catch (error) {
        console.error('❌ Service Worker: Habit sync failed', error);
    }
}

// Sync routine when back online
async function syncRoutine() {
    try {
        console.log('🔄 Service Worker: Syncing routine...');

        // Get offline routine logs from IndexedDB
        const offlineRoutines = await getOfflineRoutines();

        for (const routine of offlineRoutines) {
            try {
                await fetch('/api/morning-routine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(routine)
                });

                // Remove from offline storage after successful sync
                await removeOfflineRoutine(routine.id);
            } catch (error) {
                console.error('Failed to sync routine:', error);
            }
        }

        console.log('✅ Service Worker: Routine synced');
    } catch (error) {
        console.error('❌ Service Worker: Routine sync failed', error);
    }
}

// IndexedDB helpers for offline storage
async function getOfflineHabits() {
    // Implementation would use IndexedDB
    return [];
}

async function removeOfflineHabit(id) {
    // Implementation would use IndexedDB
}

async function getOfflineRoutines() {
    // Implementation would use IndexedDB
    return [];
}

async function removeOfflineRoutine(id) {
    // Implementation would use IndexedDB
}

// Handle push notifications
self.addEventListener('push', (event) => {
    console.log('📱 Service Worker: Push notification received');

    const options = {
        body: 'Your personal assistant has a message for you!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/icons/open-96x96.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/close-96x96.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Personal Assistant', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('📱 Service Worker: Notification clicked');

    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
