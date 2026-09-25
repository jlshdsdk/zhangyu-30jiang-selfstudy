/* 全站主题：浅色 / 深色各自可调，保存在本机，不改页面正文 */
(function () {
  'use strict';
  if (window.__zyTheme) return;
  window.__zyTheme = true;

  var KEY = 'zy30-theme-v1';
  var DEFAULTS = {
    mode: 'system',
    light: { paper: '#f7f4ee', card: '#fffdf9', ink: '#1c2330', accent: '#1a56a0' },
    dark: { paper: '#16181d', card: '#21242c', ink: '#ece8e1', accent: '#8eb7f0' }
  };
  var FIELDS = [
    ['paper', '背景'],
    ['card', '卡片'],
    ['ink', '文字'],
    ['accent', '强调']
  ];

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function hexToRgb(hex) {
    var h = String(hex || '').replace('#', '').trim();
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    var n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    function c(v) {
      v = Math.max(0, Math.min(255, Math.round(v)));
      return v.toString(16).padStart(2, '0');
    }
    return '#' + c(r) + c(g) + c(b);
  }

  function mix(a, b, t) {
    var A = hexToRgb(a);
    var B = hexToRgb(b);
    if (!A || !B) return a;
    return rgbToHex(
      A.r + (B.r - A.r) * t,
      A.g + (B.g - A.g) * t,
      A.b + (B.b - A.b) * t
    );
  }

  function lum(hex) {
    var c = hexToRgb(hex);
    if (!c) return 1;
    return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
  }

  function validHex(hex) {
    return /^#[0-9a-fA-F]{6}$/.test(hex || '');
  }

  function load() {
    var state = clone(DEFAULTS);
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return state;
      var saved = JSON.parse(raw);
      if (saved.mode === 'light' || saved.mode === 'dark' || saved.mode === 'system') {
        state.mode = saved.mode;
      }
      ['light', 'dark'].forEach(function (mode) {
        var pal = saved[mode] || {};
        FIELDS.forEach(function (f) {
          if (validHex(pal[f[0]])) state[mode][f[0]] = pal[f[0]].toLowerCase();
        });
      });
    } catch (e) { /* 隐私模式或坏数据：用默认 */ }
    return state;
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function resolvedMode(state) {
    if (state.mode === 'light' || state.mode === 'dark') return state.mode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function paletteVars(pal, isDark) {
    var paper = pal.paper;
    var card = pal.card;
    var ink = pal.ink;
    var accent = pal.accent;
    var muted = mix(ink, paper, 0.46);
    var line = mix(paper, ink, isDark ? 0.18 : 0.11);
    var accentSoft = mix(paper, accent, isDark ? 0.24 : 0.12);
    var warn = isDark ? '#e0a458' : '#b45309';
    var ok = isDark ? '#5abf7c' : '#1a7f37';
    var gold = isDark ? '#e0a458' : '#c2620a';
    var green = isDark ? '#3dbe86' : '#0c7a4d';
    var red = isDark ? '#f0a097' : '#b3372c';
    var purple = isDark ? '#c4b5fd' : '#6941c6';
    var on = function (bg) { return lum(bg) > 0.64 ? '#1c2330' : '#ffffff'; };
    return {
      '--ink': ink,
      '--muted': muted,
      '--paper': paper,
      '--card': card,
      '--line': line,
      '--accent': accent,
      '--accent-soft': accentSoft,
      '--warn': warn,
      '--warn-soft': mix(paper, warn, isDark ? 0.22 : 0.13),
      '--ok': ok,
      '--code-bg': mix(card, ink, isDark ? 0.2 : 0.045),
      '--on-accent': on(accent),
      '--shadow': isDark
        ? '0 1px 2px rgba(0,0,0,.35), 0 10px 28px rgba(0,0,0,.28)'
        : '0 1px 2px rgba(28,35,48,.05), 0 8px 24px rgba(28,35,48,.06)',
      '--ink-2': muted,
      '--bg': paper,
      '--brand': accent,
      '--brand-deep': mix(accent, isDark ? '#ffffff' : '#041018', isDark ? 0.12 : 0.28),
      '--brand-soft': accentSoft,
      '--gold': gold,
      '--gold-soft': mix(paper, gold, isDark ? 0.2 : 0.12),
      '--gold-line': mix(paper, gold, isDark ? 0.38 : 0.34),
      '--green': green,
      '--green-soft': mix(paper, green, isDark ? 0.2 : 0.12),
      '--red': red,
      '--red-soft': mix(paper, red, isDark ? 0.2 : 0.12),
      '--purple': purple,
      '--purple-soft': mix(paper, purple, isDark ? 0.2 : 0.12),
      '--on-green': on(green)
    };
  }

  var state = load();
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function apply() {
    var mode = resolvedMode(state);
    var root = document.documentElement;
    var vars = paletteVars(state[mode], mode === 'dark');
    root.setAttribute('data-theme', mode);
    root.style.colorScheme = mode;
    Object.keys(vars).forEach(function (k) {
      root.style.setProperty(k, vars[k]);
    });
  }

  apply();
  if (media.addEventListener) {
    media.addEventListener('change', function () {
      if (state.mode === 'system') apply();
    });
  }

  function css() {
    var s = document.createElement('style');
    s.textContent = [
      '#theme-open{height:32px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:600 13px/1 "Microsoft YaHei","PingFang SC",sans-serif;cursor:pointer;margin-left:8px}',
      '.topbar>#theme-open{margin-left:auto}',
      '#theme-open:hover,#theme-open[aria-expanded=true]{border-color:var(--accent);color:var(--accent)}',
      '#theme-panel{position:fixed;z-index:40;width:min(360px,calc(100vw - 20px));max-height:min(78vh,560px);overflow:auto;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);padding:14px 14px 12px;font:14px/1.5 "Microsoft YaHei","PingFang SC",sans-serif}',
      '#theme-panel h2{margin:0 0 4px;font-size:15px}',
      '#theme-panel .hint{margin:0 0 10px;color:var(--muted);font-size:12.5px}',
      '#theme-panel .modes{display:flex;gap:6px;margin-bottom:12px}',
      '#theme-panel .modes button{flex:1;border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:999px;padding:5px 0;cursor:pointer;font:inherit;font-size:13px}',
      '#theme-panel .modes button.on{background:var(--accent);border-color:var(--accent);color:var(--on-accent);font-weight:700}',
      '#theme-panel fieldset{border:1px solid var(--line);border-radius:10px;margin:0 0 10px;padding:8px 10px 10px}',
      '#theme-panel legend{padding:0 6px;color:var(--muted);font-size:12.5px}',
      '#theme-panel .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
      '#theme-panel label{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:6px 8px}',
      '#theme-panel .swatch{display:flex;align-items:center;gap:6px}',
      '#theme-panel .hex{font:12px/1 ui-monospace,Consolas,monospace;color:var(--muted)}',
      '#theme-panel input[type=color]{width:28px;height:28px;padding:0;border:1px solid var(--line);border-radius:8px;background:transparent;cursor:pointer}',
      '#theme-reset{width:100%;border:1px dashed var(--line);background:transparent;color:var(--muted);border-radius:8px;padding:6px 0;cursor:pointer;font:inherit;font-size:13px}',
      '#theme-reset:hover{color:var(--accent);border-color:var(--accent)}'
    ].join('');
    document.head.appendChild(s);
  }

  function mount() {
    css();
    var btn = document.createElement('button');
    btn.id = 'theme-open';
    btn.type = 'button';
    btn.textContent = '主题';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'theme-panel');

    var panel = document.createElement('div');
    panel.id = 'theme-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '主题颜色');

    var title = document.createElement('h2');
    title.textContent = '主题颜色';
    var hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = '浅色、深色分开保存，只存在这台浏览器里。';
    panel.appendChild(title);
    panel.appendChild(hint);

    var modes = document.createElement('div');
    modes.className = 'modes';
    var modeBtns = {};
    [['light', '浅色'], ['dark', '深色'], ['system', '跟随系统']].forEach(function (pair) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = pair[1];
      b.addEventListener('click', function () {
        state.mode = pair[0];
        save(state);
        apply();
        paintModes();
      });
      modeBtns[pair[0]] = b;
      modes.appendChild(b);
    });
    panel.appendChild(modes);

    function paintModes() {
      Object.keys(modeBtns).forEach(function (k) {
        modeBtns[k].classList.toggle('on', state.mode === k);
      });
    }

    ['light', 'dark'].forEach(function (mode) {
      var fs = document.createElement('fieldset');
      var lg = document.createElement('legend');
      lg.textContent = mode === 'light' ? '浅色' : '深色';
      fs.appendChild(lg);
      var grid = document.createElement('div');
      grid.className = 'grid';
      FIELDS.forEach(function (f) {
        var lab = document.createElement('label');
        lab.appendChild(document.createTextNode(f[1]));
        var swatch = document.createElement('span');
        swatch.className = 'swatch';
        var hex = document.createElement('span');
        hex.className = 'hex';
        hex.textContent = state[mode][f[0]];
        var input = document.createElement('input');
        input.type = 'color';
        input.value = state[mode][f[0]];
        input.setAttribute('aria-label', (mode === 'light' ? '浅色' : '深色') + f[1]);
        input.addEventListener('input', function () {
          state[mode][f[0]] = input.value.toLowerCase();
          hex.textContent = state[mode][f[0]];
          save(state);
          apply();
        });
        swatch.appendChild(hex);
        swatch.appendChild(input);
        lab.appendChild(swatch);
        grid.appendChild(lab);
      });
      fs.appendChild(grid);
      panel.appendChild(fs);
    });

    var reset = document.createElement('button');
    reset.id = 'theme-reset';
    reset.type = 'button';
    reset.textContent = '恢复默认颜色';
    reset.addEventListener('click', function () {
      var mode = state.mode;
      state = clone(DEFAULTS);
      state.mode = mode;
      save(state);
      apply();
      panel.querySelectorAll('input[type=color]').forEach(function (input, i) {
        var modeName = i < 4 ? 'light' : 'dark';
        var key = FIELDS[i % 4][0];
        input.value = state[modeName][key];
        var hex = input.previousElementSibling;
        if (hex) hex.textContent = input.value;
      });
    });
    panel.appendChild(reset);

    function place() {
      var r = btn.getBoundingClientRect();
      var width = Math.min(360, window.innerWidth - 20);
      var left = Math.min(Math.max(10, r.right - width), window.innerWidth - width - 10);
      panel.style.width = width + 'px';
      panel.style.left = left + 'px';
      panel.style.top = (r.bottom + 8) + 'px';
    }
    function setOpen(open) {
      if (open) place();
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    window.addEventListener('resize', function () { if (!panel.hidden) place(); });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(panel.hidden);
    });
    document.addEventListener('click', function (e) {
      if (panel.hidden) return;
      if (panel.contains(e.target) || e.target === btn) return;
      setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    paintModes();
    var bar = document.querySelector('.topbar .bar-inner') || document.querySelector('.topbar');
    if (bar) bar.appendChild(btn);
    else document.body.appendChild(btn);
    document.body.appendChild(panel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
