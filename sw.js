/* Primal Fitness service worker — network-first so updates always come through.
   Only caches same-origin GETs (the app shell). Supabase API calls and any
   non-GET requests are never intercepted, so data is always live. */
const CACHE = 'primal-shell-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
  await self.clients.claim();
})()));

self.addEventListener('fetch', e => {
  const req = e.request;
  // Leave Supabase (cross-origin) and non-GET requests completely untouched.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(req);                 // always try the network first
      if (res && res.ok) {
        const c = await caches.open(CACHE);
        c.put(req, res.clone());                     // refresh the offline copy
      }
      return res;
    } catch (err) {
      const cached = await caches.match(req);        // offline: fall back to last copy
      if (cached) return cached;
      throw err;
    }
  })());
});
