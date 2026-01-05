// Service Worker para Pawn Systems Market
// Cache global para todos los usuarios

const CACHE_VERSION = 'psm-v2.0';
const CACHE_NAME = `pawn-systems-market-${CACHE_VERSION}`;

// Archivos para cache global (todos los usuarios los tendrán)
const GLOBAL_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/sw-register.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando archivos globales...');
        return Promise.all(
          GLOBAL_ASSETS.map(url => {
            return fetch(url)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                return cache.put(url, response);
              })
              .catch(error => {
                console.warn(`[SW] No se pudo cachear ${url}:`, error);
              });
          })
        ).then(() => {
          console.log('[SW] Todos los archivos fueron cacheados o intentados');
          return self.skipWaiting(); // Activar inmediatamente
        });
      })
      .catch(error => {
        console.error('[SW] Error durante la instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Borrar caches antiguos
          if (cache !== CACHE_NAME) {
            console.log('[SW] Eliminando cache antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker activado y listo');
      return self.clients.claim(); // Tomar control de todas las pestañas
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  // Evitar cachear requests de chrome-extension o data:
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.startsWith('data:')) {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // Para archivos locales (estáticos) - Cache First
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Devolver del cache y actualizar en background
            const fetchPromise = fetch(event.request)
              .then(networkResponse => {
                // Solo cachear respuestas exitosas y que sean GET
                if (networkResponse.ok && event.request.method === 'GET') {
                  const responseToCache = networkResponse.clone();
                  caches.open(CACHE_NAME)
                    .then(cache => {
                      cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
              })
              .catch(() => cachedResponse); // Si falla la red, usar cache
            
            return cachedResponse;
          }
          
          // Si no está en cache, fetch normal
          return fetch(event.request)
            .then(response => {
              // Solo cachear respuestas exitosas y que sean GET
              if (response.ok && event.request.method === 'GET') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            })
            .catch(error => {
              console.error('[SW] Error en fetch:', error);
              
              // Si estamos en la página principal, devolver página de fallback
              if (url.pathname === '/' || url.pathname === '/index.html') {
                return caches.match('/index.html');
              }
              
              // Para CSS/JS, devolver versión cacheadas si existen
              if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
                return caches.match(event.request);
              }
              
              // Devolver respuesta de error genérica
              return new Response('Error de red. Verifica tu conexión a internet.', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' },
              });
            });
        })
    );
  }
  
  // Para recursos externos (CDN) - Stale While Revalidate
  else if (url.hostname.includes('cdnjs.cloudflare.com') || 
           url.hostname.includes('fonts.googleapis.com') ||
           url.hostname.includes('fonts.gstatic.com')) {
    
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Si tenemos cache, devolverlo pero actualizar en background
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache));
              }
              return networkResponse;
            })
            .catch(() => {}); // Ignorar errores en actualización
          
          return cachedResponse || fetchPromise || new Response();
        })
    );
  }
});

// Manejar mensajes desde la página principal
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    caches.open(CACHE_NAME)
      .then(cache => cache.keys())
      .then(keys => {
        event.ports[0].postMessage({
          type: 'CACHE_INFO',
          cacheSize: keys.length,
          cacheName: CACHE_NAME,
          version: CACHE_VERSION
        });
      });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME)
      .then(() => {
        // Crear nuevo cache vacío
        return caches.open(CACHE_NAME);
      })
      .then(() => {
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED',
          success: true
        });
      })
      .catch(error => {
        console.error('[SW] Error al limpiar cache:', error);
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED',
          success: false
        });
      });
  }
  
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    // Forzar actualización de la página
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'FORCE_REFRESH',
          version: CACHE_VERSION
        });
      });
    });
  }
});

// Manejo de notificaciones push
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '¡Nuevo pedido recibido!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Pawn Systems Market', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si no hay ventanas, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Sincronización en background (para futuras funcionalidades)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    console.log('[SW] Sincronizando pedidos offline...');
    // Aquí podrías sincronizar datos pendientes cuando hay conexión
  }
});

// Manejo de actualizaciones de contenido
self.addEventListener('controllerchange', () => {
  console.log('[SW] Controller cambiado - Nueva versión disponible');
});