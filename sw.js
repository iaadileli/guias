// Solo la portada; cada guía tiene su propio sw.js. Primero la red y, sin conexión, la copia.
// Las cachés se comparten en todo iaadileli.github.io: aquí solo se tocan las "guias-portada-".
const PRE = 'guias-portada-', CACHE = PRE + 'v1';
const FICHEROS = ['index.html', 'manifest.webmanifest', 'icono.svg', 'icono-180.png', 'icono-192.png', 'icono-512.png',
  ...['copenhague', 'tailandia', 'lyon', 'nerja', 'londres', 'vietnam'].map(g => 'portadas/' + g + '.jpg')];
const carga = () => caches.open(CACHE).then(c => c.addAll(FICHEROS.map(u => new Request(u, {cache: 'no-cache'}))));
self.addEventListener('install', e => e.waitUntil(carga().then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PRE) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const copia = () => caches.open(CACHE).then(c => c.match(e.request, {ignoreSearch: true}));
  const red = fetch(e.request);
  if (e.request.mode === 'navigate') e.waitUntil(red.then(() => carga()).catch(() => {}));
  const lento = new Promise(ok => setTimeout(ok, 3000)).then(copia).then(m => m || red);
  e.respondWith(Promise.race([red, lento]).catch(() => copia().then(m => m || Response.error())));
});
