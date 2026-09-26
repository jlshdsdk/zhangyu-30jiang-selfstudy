/* 张宇基础30讲·高数 — 全站脚本（无框架） */
(function () {
  'use strict';

  var KATEX_OPTS = {
    delimiters: [
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false }
    ],
    throwOnError: false,
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  };

  // KaTeX 增量渲染: 只渲染视口±800px 内的块, 滚动到再渲染其余
  // (1000+ 公式的整页同步渲染会把主线程卡住数秒)
  function renderMath() {
    if (typeof renderMathInElement !== 'function') {
      console.warn('KaTeX auto-render 未加载, 公式保持原文');
      return;
    }
    var root = document.querySelector('main') || document.body;
    if (!('IntersectionObserver' in window)) {
      renderMathInElement(root, KATEX_OPTS);  // 老浏览器兜底: 全量
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          renderMathInElement(entries[i].target, KATEX_OPTS);
          io.unobserve(entries[i].target);
        }
      }
    }, { rootMargin: '800px 0px' });
    for (var i = 0; i < root.children.length; i++) {
      io.observe(root.children[i]);
    }
  }

  // 知识清单勾选状态持久化（按页面路径 + 条目序号; 事件委托）
  function bindChecklist() {
    var list = document.querySelector('ul.checklist');
    if (!list) return;
    var boxes = list.querySelectorAll('input[type="checkbox"]');
    var base = 'ck:' + location.pathname;
    boxes.forEach(function (box, i) {
      var key = base + '#' + i;
      try {
        var saved = localStorage.getItem(key);
        if (saved !== null) box.checked = (saved === '1');  // 存过才覆盖 HTML 默认
      } catch (e) { /* 隐私模式忽略 */ }
    });
    list.addEventListener('change', function (e) {
      var box = e.target;
      if (box.type !== 'checkbox') return;
      var idx = Array.prototype.indexOf.call(boxes, box);
      if (idx < 0) return;
      try {
        localStorage.setItem(base + '#' + idx, box.checked ? '1' : '0');
      } catch (e) { }
    });
  }

  // 返回顶部按钮
  function bindBacktop() {
    var btn = document.createElement('button');
    btn.id = 'backtop';
    btn.type = 'button';
    btn.title = '返回顶部';
    btn.textContent = '↑';
    btn.style.display = 'none';
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);
    window.addEventListener('scroll', function () {
      btn.style.display = window.scrollY > 800 ? 'block' : 'none';
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindChecklist();
    renderMath();
    bindBacktop();
  });

  /* Service Worker：回访秒开 + 离线可学（缓存后台静默更新，内容更新不受影响） */
  var siteRoot = location.pathname
    .replace(/[^/]*$/, '')
    .replace(/(?:lectures|basics)\/$/, '');
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(siteRoot + 'sw.js', { scope: siteRoot })
        .catch(function () {});
    });
  }

  /* 链接预热：指针碰到站内 .html 链接即后台拉取，点开即出 */
  var warmed = {};
  document.addEventListener('pointerover', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var u = null;
    try { u = new URL(a.href); } catch (err) { return; }
    if (u.origin !== location.origin || warmed[u.href]) return;
    if (!/\.html?$/i.test(u.pathname) && u.pathname !== siteRoot) return;
    warmed[u.href] = true;
    fetch(u.href, { credentials: 'same-origin' }).catch(function () {});
  }, { passive: true });
})();
