const CACHE_NAME = 'calendar_cach';
const CACHE_FILES = [
  '.',
  './index.html',
  './indexedDB.js',
  './time_utils.js',
  './list.js',
  './main.js',
  './style.css',
  './notification-calendar.png',
  './favicon.ico',
];

/**
 * Подписываемся на данное событие, что бы указать какие кэшировать файлы для offline режима
 */
self.addEventListener('install', (event) => {
  console.log('Установлен');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(CACHE_FILES)
      ).catch(e => console.log(e))
  );
});

/**
 * Восстанавливаем данные из кэша
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});