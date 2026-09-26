/* 张宇30讲·零基础 —— 共享脚本（仅 KaTeX 渲染 + 移动端目录开合） */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    // KaTeX 公式渲染（本地 vendor，无任何外链）
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false,
        strict: "ignore",
        trust: false,
        macros: {}
      });
    }

    // 移动端侧边目录
    var btn = document.getElementById("menuBtn");
    var sidebar = document.getElementById("sidebar");
    // 侧边栏定位到当前小节（节次靠后时保证高亮项可见）
    var active = document.querySelector(".sidebar a.active");
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ block: "center" });
    }
    if (btn && sidebar) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        sidebar.classList.toggle("open");
      });
      document.addEventListener("click", function (e) {
        if (sidebar.classList.contains("open") && !sidebar.contains(e.target) && e.target !== btn) {
          sidebar.classList.remove("open");
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") sidebar.classList.remove("open");
      });
      // 点击目录链接后收起
      sidebar.addEventListener("click", function (e) {
        if (e.target.closest("a")) sidebar.classList.remove("open");
      });
    }
  });

  /* Service Worker：回访秒开 + 离线可学（缓存后台静默更新，内容更新不受影响） */
  var siteRoot = location.pathname
    .replace(/[^/]*$/, "")
    .replace(/(?:lectures|basics)\/$/, "");
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(siteRoot + "sw.js", { scope: siteRoot })
      .catch(function () {});
  }

  /* 链接预热：指针碰到站内 .html 链接即后台拉取，点开即出 */
  var warmed = {};
  document.addEventListener("pointerover", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var u = null;
    try { u = new URL(a.href); } catch (err) { return; }
    if (u.origin !== location.origin || warmed[u.href]) return;
    if (!/\.html?$/i.test(u.pathname) && u.pathname !== siteRoot) return;
    warmed[u.href] = true;
    fetch(u.href, { credentials: "same-origin" }).catch(function () {});
  }, { passive: true });
})();
