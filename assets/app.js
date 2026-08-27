/* ============================================================
   Cairn Website — app.js
   Mobile nav · FAQ accordion · Copy buttons · Scroll fade-in
   ============================================================ */

(function () {
  'use strict';

  // ── Theme (light/dark) + screenshot swap ────────────────────
  var STORAGE_KEY = 'cairn-site-theme';
  var META_THEME = document.querySelector('meta[name="theme-color"]');

  function systemPrefersLight() {
    try { return window.matchMedia('(prefers-color-scheme: light)').matches; } catch (e) { return false; }
  }

  function getTheme() {
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      if (s === 'light' || s === 'dark') return s;
    } catch (e) {}
    // Respect the data-theme already set by the inline head script if present
    var attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
    return systemPrefersLight() ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    if (META_THEME) META_THEME.setAttribute('content', theme === 'light' ? '#fdfcfa' : '#8faf6f');
    // Swap screenshots: assets/screenshots/*.png <-> assets/screenshots/dark/*.png
    document.querySelectorAll('img[src*="screenshots/"]').forEach(function (img) {
      var src = img.getAttribute('src') || '';
      // Normalise: remember original light src once
      if (!img.dataset.lightSrc) {
        // strip any /dark/ segment to get canonical light path
        img.dataset.lightSrc = src.replace(/\/dark\//, '/');
      }
      if (!img.dataset.darkSrc) {
        img.dataset.darkSrc = img.dataset.lightSrc.replace('screenshots/', 'screenshots/dark/');
      }
      var target = theme === 'dark' ? img.dataset.darkSrc : img.dataset.lightSrc;
      if (src !== target) {
        // onerror fallback to light if dark asset is missing (until screenshots are regenerated)
        img.onerror = function () {
          if (img.getAttribute('src') === img.dataset.darkSrc) {
            img.onerror = null;
            img.setAttribute('src', img.dataset.lightSrc);
          }
        };
        img.setAttribute('src', target);
      }
    });
  }

  // Initialise immediately (inline head script may have already set data-theme)
  applyTheme(getTheme());

  // Listen for system changes when user has no explicit preference
  try {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      try { if (localStorage.getItem(STORAGE_KEY)) return; } catch (err) {}
      applyTheme(e.matches ? 'light' : 'dark');
    });
  } catch (e) {}

  // Toggle button (present in nav on every page)
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme') || getTheme();
        var next = cur === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        btn.setAttribute('aria-pressed', String(next === 'light'));
      });
      // keep aria in sync
      btn.setAttribute('aria-pressed', String(getTheme() === 'light'));
    }
  });

  // ── Mobile nav toggle ──────────────────────────────────────
  var navToggle = document.getElementById('nav-toggle');
  const navMobile = document.getElementById('nav-mobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function () {
      const open = navMobile.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !navMobile.contains(e.target)) {
        navMobile.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on link click
    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMobile.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── FAQ accordion ─────────────────────────────────────────
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if it wasn't already open)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── Copy buttons ──────────────────────────────────────────
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-copy-target');
      let text = '';

      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) text = el.innerText || el.textContent;
      } else {
        // Fallback: copy sibling pre element
        const pre = btn.parentElement.querySelector('pre');
        if (pre) text = pre.innerText || pre.textContent;
      }

      if (!text) return;

      navigator.clipboard.writeText(text.trim()).then(function () {
        const original = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      }).catch(function () {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text.trim();
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);

        const original = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

  // ── Scroll fade-in ────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-up').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // No IntersectionObserver — just show everything
    document.querySelectorAll('.fade-up').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ── Highlight active docs sidebar link ───────────────────
  (function highlightActiveSidebarLink() {
    const links = document.querySelectorAll('.sidebar-link');
    const currentPath = window.location.pathname;

    links.forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;

      // Resolve relative href against current page
      const resolved = new URL(href, window.location.href).pathname;

      if (
        resolved === currentPath ||
        (currentPath.endsWith('/') && resolved === currentPath + 'index.html') ||
        resolved === currentPath.replace(/\/$/, '/index.html')
      ) {
        link.classList.add('active');
      }
    });

    // Fallback: match by filename
    if (!document.querySelector('.sidebar-link.active')) {
      const filename = currentPath.split('/').pop() || 'index.html';
      links.forEach(function (link) {
        const href = link.getAttribute('href') || '';
        if (href.endsWith(filename)) {
          link.classList.add('active');
        }
      });
    }
  })();

})();
