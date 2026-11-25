// Vóley Playa · app instalable (v4.5)
// Siempre intenta traer la versión más nueva de internet; si no hay señal, muestra la última guardada.
// No guarda nada de Supabase (reservas, datos de jugadores): eso siempre va directo y en vivo.
const CACHE = 'voley-v4.7';
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

// v4.7 · Notificaciones: las muestra aunque la página esté cerrada
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { titulo: 'Vóley Playa Tesalia', cuerpo: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.titulo || 'Vóley Playa Tesalia', {
    body: d.cuerpo || '', icon: 'icono-192.png', badge: 'icono-192.png', vibrate: [120, 60, 120],
    tag: d.tag || undefined, data: { url: d.url || './' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL(e.notification.data && e.notification.data.url || './', self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) { if (w.url.split('#')[0] === url.split('#')[0] && 'focus' in w) { w.navigate(url); return w.focus(); } }
    return clients.openWindow(url);
  }));
});
