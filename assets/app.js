/* ============================================================
   Cairn Website — app.js
   Mobile nav · FAQ accordion · Copy buttons · Scroll fade-in
   ============================================================ */

(function () {
  'use strict';

  // ── Mobile nav toggle ──────────────────────────────────────
  const navToggle = document.getElementById('nav-toggle');
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
