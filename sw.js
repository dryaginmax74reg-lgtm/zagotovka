const CACHE = 'zagotovka-v42';
const APP_FILES = [
  './', 'index.html', 'manifest.webmanifest', 'icon.svg',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('zagotovka-') && key !== CACHE)
      .map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin) return;
  const isThumbnail = /\/assets\/recipe-sprite-\d+-thumb\.webp$/.test(url.pathname);
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (isThumbnail) {
      const cached = await cache.match(request);
      if (cached) return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const app = await cache.match('./');
        if (app) return app;
      }
      throw error;
    }
  })());
});

self.addEventListener('notificationclick',event=>{
  if(event.notification.tag!=='zagotovka-cook-timer')return;
  event.notification.close();
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const app=windows.find(client=>client.url.startsWith(self.registration.scope));
    if(app){await app.focus();return;}
    await self.clients.openWindow(self.registration.scope);
  })());
});
