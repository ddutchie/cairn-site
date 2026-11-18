# Cairn Site — Agent Guide

Static marketing + docs site for Cairn. Plain HTML/CSS/JS, no build step, no
dependencies. Served by GitHub Pages from `main`.

## Layout

- `index.html` — homepage (features, MCP section).
- `docs/*.html` — one page per doc. Shared sidebar + header markup.
- `assets/` — `style.css`, `app.js` (theme, mobile nav, copy buttons),
  `community.js` (live community-connector browser), `screenshots/` (+ `dark/`).
- `changelog.html` — renders GitHub releases live. Never needs editing.
- `SITE-SYNC.md` — what the site covers and how far behind the app it is.
  Read it before any content pass.

## The one rule: never hand-edit generated regions

Sidebars, tool tables and tool counts are generated. Hand edits there get
overwritten by the sync script (that is the point).

- `docs/_nav.json` — sidebar sections, page order/titles, per-page anchors,
  plus `orphans` (pages kept out of the shared nav, e.g. the dashboards
  removal notice, which keeps only its own self-link).
- `docs/_tools.json` — the Cairn tool list (`version` = app version it
  matches): per-tool kind/section/descriptions, chat-table order, chat-only
  flags, engine-only rows. MCP set = every tool that isn't chat-only.
- `sync-site.mjs` — regenerates everything from the two JSON files:
  sidebars (`NAV:START/END`), prev/next cards in strict nav order
  (`PAGENAV:START/END`; orphans keep hand-written cards), mcp.html section
  tables (`TABLE:START/END`) + "exposes N tools", ai-chat.html rows
  (`ROWS:START/END`), index.html "N consolidated tools".

```bash
node sync-site.mjs          # regenerate
node sync-site.mjs --check # CI gate: exit 1 if out of sync
```

Adding a page = one `_nav.json` entry + run the script (anchors stay with
their page). Changing a tool = one `_tools.json` edit + run the script.
`--check` must pass before push.

## Content passes (new app version)

1. Read `SITE-SYNC.md`, then every `../cairn/changelogs/vX.Y.Z.md` newer
   than "Last synced app version". Only user-facing changes go on the site.
2. New/changed views → new/updated `docs/*.html` page (copy `usage.html`
   structure: head, nav, `docs-layout` + sidebar, `docs-content`,
   `app.js` script). Register in `_nav.json`, run the sync script.
3. Tool changes → update `_tools.json` (`version` too), run the sync script.
4. Screenshots: in the cairn repo, `npm run screenshots` writes here
   (`assets/screenshots/`, light + `dark/`). Fixture/mocks live there
   (`tests/fixtures/screenshot-fixture.ts`); the `today.png`/`usage.png`/
   `agent.png` shots need seeded mock data, not a live backend.
5. Update `SITE-SYNC.md`: bump version + date, touched pages, log row.
6. Keep mobile claims off the site until the native app ships (no App Store
   / download language). Device Sync stays a light mention for the same
   reason. Details in `SITE-SYNC.md`.

## Deploy

`main` is live. Work on a branch, open a PR, merge to publish. Small doc
fixes may go straight to `main`. Never commit to bump versions or dates
by hand — they come from the changelog being synced.
