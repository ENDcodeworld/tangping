/* 韬哄钩 Service Worker锛氶潤鎬佽祫婧愰缂撳瓨 + 杩愯鏃剁紦瀛橈紝绂荤嚎鍙敤 */
const CACHE_STATIC = 'tp-static-v7';

const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/data-products.js',
  './js/data-articles.js',
  './js/data-quiz.js',
  './js/data-feed.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_STATIC).then(c => c.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_STATIC).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // 闈欐€佽祫婧愶細缃戠粶浼樺厛锛岀绾垮洖閫€缂撳瓨锛汼PA 瀵艰埅鍥為€€ index.html
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE_STATIC).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then(hit =>
        hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())
      )
    )
  );
});

