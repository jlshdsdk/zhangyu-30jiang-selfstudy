/* 张宇30讲自学站 — Service Worker：回访秒开 + 离线可学 + 后台静默更新
   只做传输层缓存，不改动任何页面内容与功能；线上内容更新后，读者下次
   打开仍先看缓存、后台自动换新，再刷新一次即为最新。
   如需立刻向所有读者强制换新：把下面 VERSION 改成新值即可。 */
(function () {
  'use strict';

  var VERSION = 'v1-2026-09-26';
  var CACHE = 'zy30-' + VERSION;
  var SCOPE = new URL(self.registration.scope).pathname;

  self.addEventListener('install', function (event) {
    event.waitUntil(
      caches.open(CACHE)
        .then(function (cache) {
          // 预热首页：离线时至少目录可看（失败不阻塞安装）
          return cache.add(SCOPE).catch(function () {});
        })
        .then(function () { return self.skipWaiting(); })
    );
  });

  self.addEventListener('activate', function (event) {
    event.waitUntil(
      caches.keys()
        .then(function (keys) {
          return Promise.all(keys.map(function (k) {
            if (k !== CACHE) return caches.delete(k);
          }));
        })
        .then(function () { return self.clients.claim(); })
    );
  });

  function offlineFallback() {
    return new Response(
      '<meta charset="utf-8"><body style="font:15px/1.7 sans-serif;padding:24px">' +
      '<p>当前离线，且这一页从未在本机打开过。</p><p>已打开过的页面离线都能看。</p></body>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  self.addEventListener('fetch', function (event) {
    var req = event.request;
    if (req.method !== 'GET') return;
    var url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.indexOf(SCOPE) !== 0) return;
    if (url.pathname === SCOPE + 'sw.js') return;

    // 站内一律「先用缓存应答，后台静默更新」：打开即秒出，内容隔次刷新
    event.respondWith(
      caches.open(CACHE).then(function (cache) {
        return cache.match(req).then(function (cached) {
          var net = fetch(req).then(function (res) {
            if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
            return res;
          }).catch(function () { return null; });

          if (cached) return cached;
          return net.then(function (res) {
            if (res) return res;
            return cache.match(req).then(function (fb) {
              return fb || offlineFallback();
            });
          });
        });
      })
    );
  });
})();
