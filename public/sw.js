// 생활정보 PWA 서비스 워커 (Service Worker)
const CACHE_NAME = 'life-news-cache-v2.6.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/life-icon.svg',
  '/version.json'
];

// 1. 서비스 워커 설치: 기본 에셋 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('PWA Cache addAll non-fatal warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. 서비스 워커 활성화: 이전 버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. 네트워크 요청 처리: Network-first with Cache fallback 전략
self.addEventListener('fetch', (event) => {
  // POST 등 비-GET 요청이나 브라우저 확장 프로그램 요청은 바이패스
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 성공적인 응답인 경우 캐시 업데이트 (단, API나 버스트 데이터는 제외 가능)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 오프라인이거나 네트워크 실패 시 캐시에서 제공
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // HTML 탐색 요청인 경우 index.html 반환
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
