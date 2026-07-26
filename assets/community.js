/* ============================================================
   Cairn Website — community.js
   Live "Browse community connectors" modal.

   Fetches the same manifest the Cairn app reads:
     https://raw.githubusercontent.com/ddutchie/cairn-community/main/manifest.json
   (GitHub raw serves access-control-allow-origin: *, so this works
   client-side from the static site.)

   Trigger any button/link with [data-community-trigger] to open it.
   ============================================================ */

(function () {
  'use strict';

  var MANIFEST_URL =
    'https://raw.githubusercontent.com/ddutchie/cairn-community/main/manifest.json';
  var REPO_URL = 'https://github.com/ddutchie/cairn-community';
  var DOCS_URL = 'external-tools.html'; // relative; rewritten for homepage below

  var triggers = document.querySelectorAll('[data-community-trigger]');
  if (!triggers.length) return;

  // Homepage lives one level above /docs, so point its docs link correctly.
  if (document.querySelector('[data-community-docs="root"]')) {
    DOCS_URL = 'docs/external-tools.html';
  }

  var overlay = null;      // modal DOM once built
  var cache = null;        // parsed manifest once fetched
  var state = { q: '', cat: 'all' };

  // ── Minimal SVG sanitiser ─────────────────────────────────
  // The manifest icons are compiled + sanitised upstream, but we
  // defensively strip anything scriptable before inserting as HTML.
  function safeSvg(svg) {
    if (typeof svg !== 'string' || svg.indexOf('<svg') === -1) return '';
    if (/<script|<foreignObject|\son\w+\s*=|javascript:/i.test(svg)) return '';
    return svg;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Normalise manifest into a flat connector list ─────────
  function flatten(manifest) {
    var out = [];
    (manifest.mcpServers || []).forEach(function (c) {
      out.push(normalise(c, 'mcp'));
    });
    (manifest.services || []).forEach(function (c) {
      out.push(normalise(c, 'service'));
    });
    return out;
  }

  function normalise(c, kind) {
    var def = c.definition || {};
    return {
      kind: kind, // 'mcp' | 'service'
      id: c.id,
      name: (def.name || c.id || '').toString(),
      category: c.category || 'Other',
      tags: c.tags || [],
      blurb: c.blurb || def.description || '',
      brandColor: c.brandColor || '#7c6af7',
      homepage: c.homepage || '',
      icon: safeSvg(c.iconSvg),
      transport: def.transport || (kind === 'mcp' ? 'http' : ''),
      auth: def.authMode || 'none',
      endpoint: def.baseUrl || def.url || ''
    };
  }

  // ── Build the modal shell once ────────────────────────────
  function build() {
    overlay = document.createElement('div');
    overlay.className = 'cc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Browse community connectors');
    overlay.innerHTML =
      '<div class="cc-modal">' +
        '<div class="cc-head">' +
          '<div>' +
            '<div class="cc-title">Community connectors</div>' +
            '<div class="cc-sub" id="cc-sub">Loading the live catalog\u2026</div>' +
          '</div>' +
          '<button class="cc-close" aria-label="Close">\u00d7</button>' +
        '</div>' +
        '<div class="cc-controls">' +
          '<input type="search" class="cc-search" placeholder="Search connectors\u2026" aria-label="Search connectors">' +
          '<div class="cc-cats" id="cc-cats"></div>' +
        '</div>' +
        '<div class="cc-body" id="cc-body"></div>' +
        '<div class="cc-foot">' +
          'Live from the <a href="' + REPO_URL + '" target="_blank" rel="noopener">cairn-community</a> registry \u2014 ' +
          'the same catalog the app reads. Install from <strong>Settings \u2192 Tools \u2192 Browse</strong> in Cairn. ' +
          '<a href="' + DOCS_URL + '">External Tools docs \u2192</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    overlay.querySelector('.cc-close').addEventListener('click', close);

    var search = overlay.querySelector('.cc-search');
    search.addEventListener('input', function () {
      state.q = search.value.trim().toLowerCase();
      renderCards();
    });
  }

  function open() {
    if (!overlay) build();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    var s = overlay.querySelector('.cc-search');
    load().then(function () { if (s) s.focus(); });
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) { if (e.key === 'Escape') close(); }

  // ── Fetch + render ────────────────────────────────────────
  function load() {
    if (cache) { renderCats(); renderCards(); return Promise.resolve(); }
    var body = overlay.querySelector('#cc-body');
    body.innerHTML = '<div class="cc-status">Fetching the live catalog\u2026</div>';
    return fetch(MANIFEST_URL, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (m) {
        cache = {
          items: flatten(m),
          updatedAt: m.updatedAt || ''
        };
        var sub = overlay.querySelector('#cc-sub');
        var n = cache.items.length;
        sub.innerHTML = n + ' connectors' +
          (cache.updatedAt ? ' \u00b7 updated ' + esc(cache.updatedAt.slice(0, 10)) : '');
        renderCats();
        renderCards();
      })
      .catch(function (err) {
        body.innerHTML =
          '<div class="cc-status cc-error">' +
            "Couldn't reach the live registry (" + esc(err.message) + ').<br>' +
            'Browse it directly on <a href="' + REPO_URL + '" target="_blank" rel="noopener">GitHub \u2197</a>.' +
          '</div>';
      });
  }

  function categories() {
    var set = {};
    cache.items.forEach(function (c) { set[c.category] = (set[c.category] || 0) + 1; });
    return Object.keys(set).sort().map(function (k) { return { name: k, count: set[k] }; });
  }

  function renderCats() {
    var wrap = overlay.querySelector('#cc-cats');
    var cats = categories();
    var html = chip('all', 'All', cache.items.length);
    cats.forEach(function (c) { html += chip(c.name, c.name, c.count); });
    wrap.innerHTML = html;
    wrap.querySelectorAll('.cc-chip').forEach(function (el) {
      el.addEventListener('click', function () {
        state.cat = el.getAttribute('data-cat');
        wrap.querySelectorAll('.cc-chip').forEach(function (x) { x.classList.remove('is-active'); });
        el.classList.add('is-active');
        renderCards();
      });
    });
  }

  function chip(value, label, count) {
    var active = state.cat === value ? ' is-active' : '';
    return '<button class="cc-chip' + active + '" data-cat="' + esc(value) + '">' +
      esc(label) + ' <span class="cc-chip-n">' + count + '</span></button>';
  }

  function match(c) {
    if (state.cat !== 'all' && c.category !== state.cat) return false;
    if (!state.q) return true;
    var hay = (c.name + ' ' + c.blurb + ' ' + c.tags.join(' ') + ' ' + c.category).toLowerCase();
    return state.q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function renderCards() {
    var body = overlay.querySelector('#cc-body');
    var items = cache.items.filter(match);
    if (!items.length) {
      body.innerHTML = '<div class="cc-status">No connectors match your search.</div>';
      return;
    }
    body.innerHTML = '<div class="cc-grid">' + items.map(card).join('') + '</div>';
  }

  function card(c) {
    var authBadge =
      c.auth === 'oauth'
        ? '<span class="cc-badge cc-badge-oauth">OAuth</span>'
        : (c.kind === 'service'
            ? '<span class="cc-badge">API key</span>'
            : '');
    var kindBadge = c.kind === 'mcp'
      ? '<span class="cc-badge cc-badge-mcp">MCP</span>'
      : '<span class="cc-badge cc-badge-svc">HTTP</span>';
    var icon = c.icon
      ? '<span class="cc-icon" style="color:' + esc(c.brandColor) + '">' + c.icon + '</span>'
      : '<span class="cc-icon cc-icon-fallback" style="background:' + esc(c.brandColor) + '">' +
          esc((c.name || '?').charAt(0)) + '</span>';
    var home = c.homepage
      ? '<a class="cc-link" href="' + esc(c.homepage) + '" target="_blank" rel="noopener">Homepage \u2197</a>'
      : '';
    return (
      '<div class="cc-card">' +
        '<div class="cc-card-top">' +
          icon +
          '<div class="cc-card-head">' +
            '<div class="cc-name">' + esc(c.name) + '</div>' +
            '<div class="cc-badges">' + kindBadge + authBadge + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="cc-blurb">' + esc(c.blurb) + '</div>' +
        (c.endpoint ? '<div class="cc-endpoint">' + esc(c.endpoint) + '</div>' : '') +
        '<div class="cc-card-foot">' +
          '<span class="cc-cat">' + esc(c.category) + '</span>' +
          home +
        '</div>' +
      '</div>'
    );
  }

  // ── Wire triggers ─────────────────────────────────────────
  triggers.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      open();
    });
  });
})();
