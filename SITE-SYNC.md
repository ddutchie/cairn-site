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

## Last synced app version: **v2.6.9**

- **Sync date:** 2026-08-07
- **App `package.json` version at sync time:** 2.6.9
- **Site pages touched this pass:** `docs/automations.html` (new), `docs/usage.html` (new),
  `docs/notes-editor.html`, `docs/ai-chat.html`, `docs/external-tools.html`,
  `docs/board.html`, `docs/workspace.html`, `docs/index.html`, `index.html`.

---

## Feature coverage map (what the site documents, and where)

| Feature | Introduced | Site location |
|---|---|---|
| Heartbeat **automations** (schedule builder, recipes, approvals, notification center) | v2.6.0 | `docs/automations.html` (dedicated page) |
| Connector-aware automations | v2.6.1 | `docs/automations.html` |
| **Usage** view (tokens/cost/requests, per-model spend, prompt cache) | v2.6.6–v2.6.7 | `docs/usage.html` (dedicated page) |
| Obsidian vault import (preview, exclude, conflict-safe, undo) | v2.5.16, v2.6.1, v2.6.8 | `docs/workspace.html`, `docs/index.html` |
| Editor Edit/Read modes + Live Preview toggle, inline callouts/code/tables/math/mermaid | v2.6.3 | `docs/notes-editor.html` |
| Accent colour presets | v2.5.15 | `docs/index.html`, `index.html` |
| Custom slash commands + community commands | v2.5.18 | `docs/ai-chat.html` |
| Community **AI providers** (install from catalog) | v2.5.19–v2.5.20 | `docs/ai-chat.html` |
| Model picker search/favourites, cost + logo rows, image/PDF attachments | v2.5.18, v2.5.20 | `docs/ai-chat.html` |
| Board priority filters + search | v2.6.1 | `docs/board.html` |
| Slack MCP + pre-registered-app OAuth fields | v2.6.4 | `docs/external-tools.html` |
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
| Live Preview (hide-markers-while-typing) | v2.5.6 | `docs/notes-editor.html` |
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
| 2026-08-07 | v2.6.9 | Catch-up from v2.5.10 → v2.6.9. Added Automations + Usage docs pages (with sidebar links across all docs pages), refreshed Notes editor (Edit/Read + Live Preview toggle + inline blocks), AI Chat (model picker search/favourites/cost, community AI providers, attachments, slash commands, max output tokens), Board (priority filters + search), External Tools (Slack/pre-registered-app OAuth), Workspace (vault import, code directory), Getting Started (vault detection, accent colours), homepage (Automations + Usage rows, community providers, attachments, accent colours). Mobile intentionally left untouched. |
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
