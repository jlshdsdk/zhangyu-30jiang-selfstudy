/* 张宇基础30讲·高数 — 全站脚本（无框架） */
(function () {
  'use strict';

  // KaTeX 渲染（本地 vendor 资产，auto-render）
  function renderMath() {
    if (typeof renderMathInElement !== 'function') {
      console.warn('KaTeX auto-render 未加载, 公式保持原文');
      return;
    }
    renderMathInElement(document.body, {
      delimiters: [
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false,
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    });
  }

  // 知识清单勾选状态持久化（按页面路径 + 条目序号）
  function bindChecklist() {
    var boxes = document.querySelectorAll('ul.checklist input[type="checkbox"]');
    var base = 'ck:' + location.pathname;
    boxes.forEach(function (box, i) {
      var key = base + '#' + i;
      try {
        var saved = localStorage.getItem(key);
        if (saved !== null) box.checked = (saved === '1');  // 存过才覆盖 HTML 默认
      } catch (e) { /* 隐私模式忽略 */ }
      box.addEventListener('change', function () {
        try {
          localStorage.setItem(key, box.checked ? '1' : '0');
        } catch (e) { }
      });
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
})();
