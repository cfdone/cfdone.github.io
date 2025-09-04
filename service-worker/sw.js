/**
 * CFDONE Service Worker
 * Handles background notifications, caching, and PWA functionality
 */

const CACHE_NAME = 'cfdone-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Don't cache non-successful responses
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            
            // Clone the response before caching
            const responseToCache = fetchResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return fetchResponse;
          });
      })
      .catch(() => {
        // Return offline page for navigation requests when offline
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'schedule-notifications') {
    event.waitUntil(scheduleNotifications());
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      tag: data.tag || 'cfdone-notification',
      data: data.data || {},
      actions: data.actions || [
        {
          action: 'view',
          title: 'View Schedule',
          icon: '/favicon.svg'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/favicon.svg'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app when notification is clicked
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If app is already open, focus it
          for (const client of clientList) {
            if (client.url.includes(self.location.origin)) {
              return client.focus();
            }
          }
          
          // Otherwise, open new window
          return self.clients.openWindow('/');
        })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification (already handled above)
    console.log('Notification dismissed');
  } else {
    // Default action - open the app
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', () => {
  console.log('Service Worker: Notification closed');
});

// Message event - communication between main thread and service worker
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleNotifications();
  } else if (event.data && event.data.type === 'CLEAR_NOTIFICATIONS') {
    clearAllNotifications();
  }
});

// Helper function to schedule notifications
async function scheduleNotifications() {
  try {
    console.log('Service Worker: Scheduling notifications...');
    
    // Get all clients (tabs/windows with the app open)
    const clients = await self.clients.matchAll();
    
    if (clients.length > 0) {
      // Send message to main thread to handle scheduling
      clients[0].postMessage({
        type: 'SCHEDULE_NOTIFICATIONS_REQUEST'
      });
    }
  } catch (error) {
    console.error('Service Worker: Error scheduling notifications', error);
  }
}

// Helper function to clear all notifications
async function clearAllNotifications() {
  try {
    const notifications = await self.registration.getNotifications();
    notifications.forEach(notification => notification.close());
    console.log('Service Worker: Cleared all notifications');
  } catch (error) {
    console.error('Service Worker: Error clearing notifications', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered', event.tag);
  
  if (event.tag === 'schedule-daily-notifications') {
    event.waitUntil(scheduleNotifications());
  }
});

console.log('Service Worker: Script loaded');
