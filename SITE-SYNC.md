# Cairn site ↔ app sync tracker

This file records how far the marketing/docs site (`cairn-site`) has been brought up
to date against the main Cairn app's changelogs (`../cairn/changelogs/`).

**When you update the site for new features:** read every `../cairn/changelogs/vX.Y.Z.md`
*newer* than the "Last synced app version" below, fold the user-facing ones into the site,
then bump the version and date here and append a row to the log. That way you never have
to re-read the whole changelog history — only the delta since the last sync.

> **Note on mobile:** the mobile companion app is **not released** (still in testing).
> Keep mobile claims on the site conservative — do not expand `docs/mobile.html` or add
> App Store / download language until it ships.

---

## Last synced app version: **v2.5.10**

- **Sync date:** 2026-07-26
- **App `package.json` version at sync time:** 2.5.10
- **Site pages touched this pass:** `docs/external-tools.html` (new), `docs/mcp.html`,
  `docs/ai-chat.html`, `docs/notes-editor.html`, `docs/knowledge-graph.html`,
  `docs/calendar.html` (new), `docs/index.html`, `index.html`.

---

## Feature coverage map (what the site documents, and where)

| Feature | Introduced | Site location |
|---|---|---|
| MCP **server** (Cairn → external clients) | early | `docs/mcp.html` |
| MCP **client** / External Tools (Cairn → remote MCP servers + HTTP APIs) | v2.3.4 | `docs/external-tools.html` |
| AI Tool Builder ("Build with AI") | v2.3.4–v2.3.5 | `docs/external-tools.html` |
| OAuth 2.1 sign-in for MCP servers + HTTP services | v2.3.4, v2.5.7 | `docs/external-tools.html` |
| Community tool registry / Browse Community | v2.5.6–v2.5.8 | `docs/external-tools.html` || Multi-operation community services | v2.5.8 | `docs/external-tools.html` |
| Per-project tool attach | v2.3.4 | `docs/external-tools.html` |
| Secure credential storage (OS keychain) | v2.3.4, v2.5.9 | `docs/external-tools.html`, `docs/ai-chat.html` |
| Calendar view (⌘4) | v2.3.4 | `docs/calendar.html` |
| Saved AI providers + per-surface model picker | v2.5.9 | `docs/ai-chat.html` |
| Provider credit-balance badge | v2.5.10 | `docs/ai-chat.html` |
| models.dev auto context-window detection | v2.5.6 | `docs/ai-chat.html` |
| Subagents (dispatch → research/write) | v2.5.4–v2.5.5 | `docs/ai-chat.html`, `docs/agent.html` |
| In-chat gear settings popover | v2.5.5 | `docs/ai-chat.html` |
| Clickable external-tool result chips | v2.5.7 | `docs/ai-chat.html` |
| Knowledge Graph: canvas Force + cluster hulls, sunburst Radial, spotlight | v2.3.5 | `docs/knowledge-graph.html` |
| Live Preview editor (hide-markers-while-typing) | v2.5.6 | `docs/notes-editor.html` |
| Distraction-free / fullscreen note editing (⌘.) | v2.5.2 | `docs/notes-editor.html` |
| Reusable note templates + placeholders | v2.5.0 | `docs/notes-editor.html` |
| Markdown export (note + whole project) | v2.5.0 | `docs/notes-editor.html` |
| Drag notes / folders / cards between projects & folders | v2.5.4 | `docs/notes-editor.html`, `docs/board.html`, `docs/index.html` |
| Board / Kanban (WIP limits, dependencies, tags, archive, cross-project drag) | core | `docs/board.html` (dedicated page) |
| Merge projects | v2.5.9 | `docs/workspace.html` || New MCP-server tools (tag_note/tag_task, templates, due/overdue, semantic, rename/move) | v2.5.0+ | `docs/mcp.html` |
| Device Sync (desktop side; needs unreleased mobile app) | v2.4.0–v2.4.14 | Mentioned lightly only — **held back until mobile ships** |

---

## Deliberately NOT surfaced yet

- **Device Sync** as a headline feature — it only does anything paired with the mobile app,
  which is unreleased. Keep to a light mention at most.
- **Mobile companion** beyond the existing `docs/mobile.html` — no store/download language.

---

## Sync log

| Date | Synced to | Notes |
|---|---|---|
| 2026-07-26 | v2.5.10 | Big catch-up from ~v2.0. Added External Tools (MCP client) page + Calendar page; refreshed MCP tool reference (37→51), AI Chat, Notes editor, Knowledge Graph, homepage. Mobile intentionally left untouched. |
| 2026-07-26 | v2.5.10 | Added a **live community connectors browser** (`assets/community.js` + modal CSS). Fetches `manifest.json` straight from the cairn-community repo (GitHub raw, CORS `*`) client-side and renders searchable/filterable cards with the same inline logos, blurbs, endpoints, and OAuth/API-key badges the app uses. Triggered by `[data-community-trigger]` buttons on `docs/external-tools.html` and the homepage. It's a read-only catalog preview — install still happens in-app (Settings → Tools → Browse). |

---

## Live community browser (how it works)

- **Source of truth:** `https://raw.githubusercontent.com/ddutchie/cairn-community/main/manifest.json`
  (identical to what the app reads via `electron/lib/community-registry.ts`).
- **Why it works on a static site:** GitHub raw returns `access-control-allow-origin: *`, so
  the browser can `fetch()` it directly — no backend, no proxy, no build step.
- **Files:** `assets/community.js` (fetch + modal + render + minimal SVG sanitiser) and the
  `.cc-*` styles appended to `assets/style.css`. Add a `data-community-trigger` button on any
  page and include `community.js` to enable it. On the homepage the button also carries
  `data-community-docs="root"` so the modal's "External Tools docs" link resolves to `docs/…`.
- **If the registry schema changes:** update `normalise()` / `flatten()` in `community.js` to
  match the new `manifest.json` shape (mirrors `shared/chat/registry-schema.ts` in the app).
