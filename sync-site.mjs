/**
 * Cairn site — single source of truth for docs navigation + tool docs.
 *
 * Usage:  node sync-site.mjs        (rewrites sidebars, tool tables, tool counts)
 *         node sync-site.mjs --check (exit 1 if anything is out of sync)
 *
 * - docs/_nav.json owns the section/page order, titles and per-page anchors.
 *   Each docs/*.html sidebar is generated between NAV:START / NAV:END markers.
 * - docs/_tools.json owns the Cairn tool list (from TOOL_SCHEMAS in the app
 *   repo, plus chat-only flags). It generates the mcp.html section tables,
 *   the ai-chat.html tool table and the "N tools" counts on mcp.html +
 *   index.html. Engine-only rows (search_sessions) live in _tools.json
 *   under engineRows so order is preserved.
 * Adding a page = one entry in _nav.json + run this script.
 * Changing a tool = one edit in _tools.json + run this script.
 * No dependencies (plain node).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(ROOT, "docs");
const NAV_FILE = path.join(DOCS, "_nav.json");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function sidebarFor(nav, pageFile) {
  const out = [];
  for (const sec of nav.sections) {
    out.push(`      <div class="sidebar-section">`);
    out.push(`        <div class="sidebar-section-title">${esc(sec.title)}</div>`);
    const links = sec.links ?? sec.pages.map((p) => ({ href: p.file, title: p.title }));
    for (const link of links) {
      const active = link.href === pageFile ? " active" : "";
      out.push(`        <a href="${link.href}" class="sidebar-link${active}">${esc(link.title)}</a>`);
      if (link.href === pageFile) {
        const anchors =
          link.anchors ?? sec.pages?.find((p) => p.file === pageFile)?.anchors ?? [];
        for (const a of anchors) {
          out.push(`        <a href="${a.href}" class="sidebar-anchor">${esc(a.title)}</a>`);
        }
      }
      // Orphan pages (kept out of the shared nav, e.g. the removal notice)
      // keep their own active self-link, positioned after `after`.
      const orphan = nav.orphans?.[pageFile];
      if (sec.pages && orphan && link.href === orphan.after) {
        out.push(`        <a href="${pageFile}" class="sidebar-link active">${esc(orphan.title)}</a>`);
      }
    }
    out.push(`      </div>`);
  }
  return out.join("\n");
}

function syncFile(file, nav, check) {
  const full = path.join(DOCS, file);
  let s = readFileSync(full, "utf8");
  const gen = sidebarFor(nav, file);
  const open = "<!-- NAV:START -->";
  const close = "<!-- NAV:END -->";
  if (s.includes(open)) {
    const next = s.replace(
      new RegExp(`${open}[\\s\\S]*?${close}`),
      `${open}\n${gen}\n      ${close}`,
    );
    if (next !== s && !check) writeFileSync(full, next);
    return next === s ? "ok" : "updated";
  }
  // First run: wrap the existing sidebar content with markers, then replace.
  const m = s.match(/(<aside class="docs-sidebar">\n)([\s\S]*?)(\n    <\/aside>)/);
  if (!m) return "no-sidebar";
  const next = s.slice(0, m.index) + m[1] + `${open}\n${gen}\n      ${close}` + m[3] + s.slice(m.index + m[0].length);
  if (!check) writeFileSync(full, next);
  return "updated";
}

const nav = JSON.parse(readFileSync(NAV_FILE, "utf8"));
const tools = JSON.parse(readFileSync(path.join(DOCS, "_tools.json"), "utf8"));
const check = process.argv.includes("--check");
const files = readdirSync(DOCS).filter((f) => f.endsWith(".html"));
let dirty = 0;
const mark = (label) => {
  dirty++;
  console.log(`${check ? "OUT OF SYNC" : "updated"}: ${label}`);
};

// ── Phase 1: sidebars ─────────────────────────────────────────────────────────
for (const f of files) {
  const r = syncFile(f, nav, check);
  if (r === "updated") mark(`docs/${f} (nav)`);
  else if (r === "no-sidebar") console.log(`skipped (no sidebar): docs/${f}`);
}

// ── Phase 2: tool tables + counts ─────────────────────────────────────────────
const mcpCount = Object.values(tools.tools).filter((t) => !t.chatOnly).length;

function replaceBlock(s, open, close, gen) {
  return s.replace(
    new RegExp(`${open}[\\s\\S]*?${close}`),
    () => `${open}\n${gen}\n${close}`,
  );
}

function syncTools() {
  // mcp.html section tables (one row per tool, grouped by section)
  {
    const full = path.join(DOCS, "mcp.html");
    let s = readFileSync(full, "utf8");
    let changed = false;
    const bySection = {};
    for (const [name, t] of Object.entries(tools.tools)) {
      if (t.chatOnly || !t.section) continue;
      (bySection[t.section] ||= []).push({ name, ...t });
    }
    for (const list of Object.values(bySection)) {
      list.sort((a, b) => tools.toolOrder.indexOf(a.name) - tools.toolOrder.indexOf(b.name));
    }
    const sectionOrder = [...new Set(tools.toolOrder.map((n) => tools.tools[n].section).filter(Boolean))];
    for (const sec of sectionOrder) {
      const rows = bySection[sec]
        .map((t) => `          <tr><td><code>${t.name}</code></td><td>${t.kind}</td><td>${t.desc}</td></tr>`)
        .join("\n");
      const table =
        `      <table class="tool-table">\n` +
        `        <thead>\n` +
        `          <tr><th>Tool</th><th>Read / Write</th><th>Description</th></tr>\n` +
        `        </thead>\n` +
        `        <tbody>\n${rows}\n        </tbody>\n` +
        `      </table>`;
      const open = `<!-- TABLE:START:${sec} -->`;
      const close = `<!-- TABLE:END -->`;
      if (s.includes(open)) {
        const next = replaceBlock(s, open, close, table);
        if (next !== s) { s = next; changed = true; }
      } else {
        const re = new RegExp(`(<h3>${sec}<\\/h3>\\n)(\\s*<table class="tool-table">[\\s\\S]*?<\\/table>)`);
        const m = s.match(re);
        if (!m) { console.log(`warning: no table found for section "${sec}"`); continue; }
        s = s.slice(0, m.index) + m[1] + `${open}\n${table}\n${close}` + s.slice(m.index + m[0].length);
        changed = true;
      }
    }
    const counted = s.replace(/exposes \d+ tools/, `exposes ${mcpCount} tools`);
    if (counted !== s) { s = counted; changed = true; }
    if (changed) {
      if (!check) writeFileSync(full, s);
      mark("docs/mcp.html (tools)");
    }
  }
  // ai-chat.html tool table (groups + engine row from engineRows)
  {
    const full = path.join(DOCS, "ai-chat.html");
    let s = readFileSync(full, "utf8");
    let changed = false;
    const rows = tools.chatTable
      .map((e) => {
        if (e.manual) {
          const r = tools.engineRows[e.manual];
          const names = r.names.map((n) => `<code>${n}</code>`).join(" / ");
          return `          <tr><td>${names}</td><td>${r.short}</td></tr>`;
        }
        const names = e.names.map((n) => `<code>${n}</code>`).join(" / ");
        const star = e.names.some((n) => tools.tools[n]?.chatOnly) ? " *" : "";
        const short = e.short ?? tools.tools[e.names[0]].short;
        return `          <tr><td>${names}${star}</td><td>${short}</td></tr>`;
      })
      .join("\n");
    const open = "<!-- ROWS:START -->";
    const close = "<!-- ROWS:END -->";
    if (s.includes(open)) {
      const next = replaceBlock(s, open, close, rows);
      if (next !== s) { s = next; changed = true; }
    } else {
      const m = s.match(/(<h2>What the AI can do<\/h2>[\s\S]*?<tbody>\n)([\s\S]*?)(\n        <\/tbody>)/);
      if (!m) console.log("warning: ai-chat tool tbody not found");
      else {
        s = s.slice(0, m.index) + m[1] + `${open}\n${rows}\n${close}` + m[3] + s.slice(m.index + m[0].length);
        changed = true;
      }
    }
    if (changed) {
      if (!check) writeFileSync(full, s);
      mark("docs/ai-chat.html (tools)");
    }
  }
  // index.html count
  {
    const full = path.join(ROOT, "index.html");
    const s = readFileSync(full, "utf8");
    const next = s.replace(/\d+ consolidated tools/, `${mcpCount} consolidated tools`);
    if (next !== s) {
      if (!check) writeFileSync(full, next);
      mark("index.html (tool count)");
    }
  }
}
// ── Phase 3: prev/next page cards ───────────────────────────────────────────────
// Strict nav order (Getting Started + Reference). Orphans keep hand-written cards.
function pageTitle(file) {
  if (file === "index.html") return "Getting Started";
  for (const sec of nav.sections) {
    const p = sec.pages?.find((p) => p.file === file) ?? (sec.links ?? []).find((l) => l.href === file);
    if (p) return p.title;
  }
  return file;
}

function syncPageNav() {
  const order = [
    "index.html",
    ...nav.sections.flatMap((sec) => (sec.pages ?? []).map((p) => p.file)),
  ];
  for (const f of files) {
    if (!order.includes(f)) continue; // orphan: leave alone
    const full = path.join(DOCS, f);
    let s = readFileSync(full, "utf8");
    let changed = false;
    const i = order.indexOf(f);
    const prev = i > 0 ? order[i - 1] : null;
    const next = i < order.length - 1 ? order[i + 1] : null;
    const card = (file, dir) =>
      dir === "prev"
        ? `        <a href="${file}" class="docs-nav-card">\n` +
          `          <div class="docs-nav-label">Previous</div>\n` +
          `          <div class="docs-nav-title">← ${esc(pageTitle(file))}</div>\n` +
          `        </a>`
        : `        <a href="${file}" class="docs-nav-card next">\n` +
          `          <div class="docs-nav-label">Next</div>\n` +
          `          <div class="docs-nav-title">${esc(pageTitle(file))} →</div>\n` +
          `        </a>`;
    const inner = [prev ? card(prev, "prev") : "        <div></div>", next ? card(next, "next") : null]
      .filter(Boolean)
      .join("\n");
    const gen = `      <div class="docs-page-nav">\n${inner}\n      </div>`;
    const open = "<!-- PAGENAV:START -->";
    const close = "<!-- PAGENAV:END -->";
    if (s.includes(open)) {
      const nextS = replaceBlock(s, open, close, gen);
      if (nextS !== s) { s = nextS; changed = true; }
    } else {
      const m = s.match(/      <div class="docs-page-nav">\n[\s\S]*?\n      <\/div>/);
      if (!m) { console.log(`warning: no page-nav in docs/${f}`); continue; }
      s = s.slice(0, m.index) + `${open}\n${gen}\n${close}` + s.slice(m.index + m[0].length);
      changed = true;
    }
    if (changed) {
      if (!check) writeFileSync(full, s);
      mark(`docs/${f} (pagenav)`);
    }
  }
}
// ── Phase 4: <head> metadata ────────────────────────────────────────────────────
// Per-page title/descriptions/URL from _nav.json; static tail (icons, fonts,
// theme script) shared. Page-specific extras after HEAD:END (e.g. the
// notes-editor mockup <style>) are left alone.
const HEAD_TAIL = [
  '  <link rel="icon" type="image/png" href="../favicon-96x96.png" sizes="96x96" />',
  '  <link rel="icon" type="image/svg+xml" href="../favicon.svg" />',
  '  <link rel="shortcut icon" href="../favicon.ico" />',
  '  <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png" />',
  '  <link rel="manifest" href="../site.webmanifest" />',
  '  <link rel="preconnect" href="https://fonts.googleapis.com">',
  '  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">',
  '  <link rel="stylesheet" href="../assets/style.css">',
  '  <script>',
  '    // Set theme before paint to avoid flash',
  '    (function () {',
  "      try {",
  "        var s = localStorage.getItem('cairn-site-theme');",
  "        var t = s === 'light' || s === 'dark' ? s : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');",
  "        document.documentElement.setAttribute('data-theme', t);",
  '      } catch (e) {}',
  '    })();',
  '  </script>',
].join("\n");

const attr = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function headFor(head) {
  return [
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `  <title>${esc(head.title)}</title>`,
    `  <meta name="description" content="${attr(head.description)}">`,
    `  <meta property="og:title" content="${esc(head.title)}">`,
    `  <meta property="og:description" content="${attr(head.ogDescription)}">`,
    '  <meta property="og:image" content="https://ddutchie.github.io/cairn-site/assets/screenshots/og-image.png">',
    '  <meta property="og:type" content="website">',
    `  <meta property="og:url" content="${head.url}">`,
    '  <meta name="twitter:card" content="summary_large_image">',
    `  <meta name="twitter:title" content="${esc(head.title)}">`,
    `  <meta name="twitter:description" content="${attr(head.twitterDescription)}">`,
    '  <meta name="twitter:image" content="https://ddutchie.github.io/cairn-site/assets/screenshots/og-image.png">',
    '  <meta name="theme-color" content="#8faf6f">',
    `  <link rel="canonical" href="${head.url}">`,
    HEAD_TAIL,
  ].join("\n");
}

function pageHead(file) {
  for (const sec of nav.sections) {
    const hit =
      sec.pages?.find((p) => p.file === file) ?? (sec.links ?? []).find((l) => l.href === file);
    if (hit?.head) return hit.head;
  }
  return nav.orphans?.[file]?.head ?? null;
}

function syncHead() {
  for (const f of files) {
    const full = path.join(DOCS, f);
    let s = readFileSync(full, "utf8");
    let changed = false;
    const head = pageHead(f);
    if (!head) { console.log(`warning: no head data for docs/${f}`); continue; }
    const gen = headFor(head);
    const open = "<!-- HEAD:START -->";
    const close = "<!-- HEAD:END -->";
    if (s.includes(open)) {
      const next = replaceBlock(s, open, close, gen);
      if (next !== s) { s = next; changed = true; }
    } else {
      const m = s.match(/(<head>\n)([\s\S]*?)(\n<\/head>)/);
      if (!m) { console.log(`warning: no head in docs/${f}`); continue; }
      // Keep page-specific extras after the theme script (e.g. mockup <style>).
      const parts = m[2].split("  </script>\n");
      const extras = parts.length > 1 ? parts.slice(1).join("  </script>\n") : "";
      s = s.slice(0, m.index) + m[1] + `${open}\n${gen}\n${close}` + extras + m[3] + s.slice(m.index + m[0].length);
      changed = true;
    }
    if (changed) {
      if (!check) writeFileSync(full, s);
      mark(`docs/${f} (head)`);
    }
  }
}

// ── Phase 5: header nav (byte-identical on every docs page) ───────────────────
const HEADER_HTML = `  <header class="nav">
    <div class="nav-inner">
      <a href="../index.html" class="nav-logo">
        <img src="../assets/icon.png" alt="Cairn icon" class="nav-logo-img">
        Cairn
      </a>
      <nav class="nav-links">
        <a href="../index.html#features">Features</a>
        <a href="index.html" style="color: var(--text-primary);">Docs</a>
        <a href="../changelog.html">Changelog</a>
        <a href="https://github.com/ddutchie/cairn" target="_blank" rel="noopener">GitHub ↗</a>
      </nav>
      <div class="nav-actions">
        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme" aria-pressed="false" title="Toggle light/dark">
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        </button>
        <a href="https://github.com/ddutchie/cairn/releases" class="btn btn-primary btn-sm">Download</a>
        <button class="nav-toggle" aria-label="Toggle menu" id="nav-toggle">
          <div class="hamburger"><span></span><span></span><span></span></div>
        </button>
      </div>
    </div>
    <nav class="nav-mobile" id="nav-mobile">
      <a href="../index.html#features">Features</a>
      <a href="index.html">Docs</a>
      <a href="../changelog.html">Changelog</a>
      <a href="https://github.com/ddutchie/cairn" target="_blank" rel="noopener">GitHub ↗</a>
      <a href="https://github.com/ddutchie/cairn/releases">Download</a>
    </nav>
  </header>`;

function syncHeader() {
  for (const f of files) {
    const full = path.join(DOCS, f);
    let s = readFileSync(full, "utf8");
    let changed = false;
    const open = "<!-- HEADER:START -->";
    const close = "<!-- HEADER:END -->";
    if (s.includes(open)) {
      const next = replaceBlock(s, open, close, HEADER_HTML);
      if (next !== s) { s = next; changed = true; }
    } else {
      const m = s.match(/  <header class="nav">[\s\S]*?\n  <\/header>/);
      if (!m) { console.log(`warning: no header in docs/${f}`); continue; }
      s = s.slice(0, m.index) + `${open}\n${HEADER_HTML}\n${close}` + s.slice(m.index + m[0].length);
      changed = true;
    }
    if (changed) {
      if (!check) writeFileSync(full, s);
      mark(`docs/${f} (header)`);
    }
  }
}

syncTools();
syncPageNav();
syncHead();
syncHeader();
syncViewsTable();

// ── Phase 6: views + shortcuts table (docs/index.html) ────────────────────────
// Generated from docs/_views.json, which is refreshed from the app during a
// release sync (`node ../cairn/scripts/export-site-data.js`). Replaces the
// hand-maintained shortcut list that rotted every time the sidebar order moved.
function syncViewsTable() {
  const full = path.join(DOCS, "index.html");
  let s = readFileSync(full, "utf8");
  let changed = false;
  const views = JSON.parse(readFileSync(path.join(DOCS, "_views.json"), "utf8")).views;
  const rows = views
    .map(
      (v) =>
        `          <tr><td>${esc(v.label)}</td><td>${v.shortcut ? `<kbd>${v.shortcut}</kbd>` : "Sidebar"}</td></tr>`,
    )
    .join("\n");
  const table =
    `      <table class="tool-table">\n` +
    `        <thead>\n` +
    `          <tr><th>View</th><th>Shortcut</th></tr>\n` +
    `        </thead>\n` +
    `        <tbody>\n${rows}\n        </tbody>\n` +
    `      </table>`;
  const open = "<!-- VIEWS:START -->";
  const close = "<!-- VIEWS:END -->";
  if (s.includes(open)) {
    const next = replaceBlock(s, open, close, table);
    if (next !== s) { s = next; changed = true; }
  } else {
    const m = s.match(/(shift the rest down.*?<\/p>\n)([\s\S]*?)(\n      <figure)/);
    if (!m) { console.log("warning: no views-table anchor in docs/index.html"); return; }
    s = s.slice(0, m.index) + m[1] + `${open}\n${table}\n${close}` + m[3] + s.slice(m.index + m[0].length);
    changed = true;
  }
  if (changed) {
    if (!check) writeFileSync(full, s);
    mark("docs/index.html (views table)");
  }
}

if (check && dirty > 0) {
  console.error(`${dirty} item(s) out of sync — run: node sync-site.mjs`);
  process.exit(1);
} else if (!check) {
  console.log(dirty === 0 ? "site in sync." : `${dirty} item(s) updated.`);
}
