// Vóley Playa · app instalable (v4.5)
// Siempre intenta traer la versión más nueva de internet; si no hay señal, muestra la última guardada.
// No guarda nada de Supabase (reservas, datos de jugadores): eso siempre va directo y en vivo.
const CACHE = 'voley-v4.5';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;        // Supabase, Google, CDN: directo
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./'))));
});
