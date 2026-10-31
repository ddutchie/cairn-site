# Cairn site ↔ app sync tracker

This file records how far the marketing/docs site (`cairn-site`) has been brought up
to date against the main Cairn app's changelogs (`../cairn/changelogs/`).

**When you update the site for new features:** read every `../cairn/changelogs/vX.Y.Z.md`
*newer* than the "Last synced app version" below, fold the user-facing ones into the site,
then bump the version and date here and append a row to the log. That way you never have
to re-read the whole changelog history — only the delta since the last sync.

> **Note on mobile:** the native mobile app is **not released** (still in testing). The old
> desktop "Mobile Access" browser companion and its `docs/mobile.html` page were removed in v3.1.8.
> Keep mobile claims off the site — no App Store / download language until the app ships.

---

## Last synced app version: **v3.1.8**

- **Sync date:** 2026-10-30
- **App `package.json` version at sync time:** 3.1.7 (v3.1.8 changelog already written, pending release)
- **Site pages touched this pass:** `index.html`, `docs/index.html`, `docs/dashboards.html`
  (rewritten as a "removed in 3.1.3" notice), `docs/notes-editor.html`, `docs/board.html`,
  `docs/calendar.html`, `docs/idea-flow.html`, `docs/knowledge-graph.html`, `docs/insights.html`,
  `docs/usage.html`, `docs/automations.html`, `docs/workspace.html`, `docs/prd-generator.html`.
  (`docs/mobile.html` was written in this pass, then deleted when Mobile Access was removed.) `changelog.html` needs no edit (it renders GitHub releases live).
  Agent / AI Chat / External Tools / MCP pages were handled by separate passes.
- **Still to do elsewhere:** `docs/agent.html`, `docs/ai-chat.html`, `docs/external-tools.html`,
  `docs/mcp.html` still carry a sidebar link to `dashboards.html` (page kept as a removal notice, so
  not dead); `docs/agent.html` has a "Dashboards" next-page card; `docs/ai-chat.html` lists the removed
  `*_dashboard` tools.

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
| **Dashboards removed** (legacy ones converted to markdown notes) | v3.1.3 | `docs/dashboards.html` (removal notice) |
| Project Overview: Shipped this week, At risk, weekly review / daily brief notes | v3.1.0 | `docs/board.html`, `index.html` |
| Board saved views + extra filters, live agent status on cards, shared right-click menus | v3.1.0, v3.1.6 | `docs/board.html`, `docs/calendar.html` |
| Quick capture (⌘⇧Space) | v3.1.0 | `docs/index.html`, `docs/board.html`, `index.html` |
| Find in note (⌘F), search excerpts/phrases, note font, changed-note dots | v3.0.13, v3.1.6, v3.1.7, v2.7.5 | `docs/notes-editor.html`, `index.html` |
| Knowledge Graph: neighbourhood mode, 3D layout, background layout, live refresh, `get_graph` | v3.0.12–v3.1.7 | `docs/knowledge-graph.html`, `index.html` |
| Insights: 8th "Semantic" canvas (was missing from docs) | v2.1.x | `docs/insights.html`, `index.html` |
| Automations: scripts, env vars, Develop agent, live watch, run logs, retries/auto-pause, daily budget | v2.7.4, v3.1.0 | `docs/automations.html`, `index.html` |
| Usage: per-thread grouping, cache-write accounting, suffix-aware estimates | v3.0.19, v3.0.21, v2.6.14 | `docs/usage.html`, `index.html` |
| Bring-your-own local inference (bundled llama.cpp removed), Local servers detection, per-provider API protocol | v3.0.0, v3.0.4, v3.1.4 | `docs/index.html`, `index.html` |
| Own agent engine replaces DeepSeek harness; sandboxed shell | v3.1.8 | `index.html`, `docs/index.html` (agent page handled separately) |
| Shorter 5-step onboarding; view shortcuts re-numbered (Board ⌘3 … Agent ⌘6, Graph ⌘8, Insights ⌘9) | v2.7.6, v3.0.0 | `docs/index.html`, `docs/board.html`, `docs/calendar.html`, `docs/knowledge-graph.html`, `docs/insights.html`, `docs/idea-flow.html` |
| Device Sync (desktop side; needs unreleased mobile app) | v2.4.0–v2.4.14 | Mentioned lightly only — **held back until mobile ships** |

---

## Deliberately NOT surfaced yet

- **Device Sync** as a headline feature — it only does anything paired with the mobile app,
  which is unreleased. Keep to a light mention at most.
- **Mobile** (native app, Device Sync) — no store/download language. The desktop browser companion no longer exists.

---

## Sync log

| Date | Synced to | Notes |
|---|---|---|
| 2026-10-30 | v3.1.8 | Catch-up v2.6.10 → v3.1.8 for everything except agent/chat/MCP pages. Dashboards page turned into a removal notice and its sidebar links dropped from the pages owned by this pass; Overview delivery, board filters/saved views, note find/search/font, graph neighbourhood + 3D, Insights Semantic canvas, automation scripts/budget/retries, usage thread grouping, 5-step onboarding, BYO local inference, view shortcuts (Board ⌘3, Calendar ⌘4, Idea Flow ⌘5, Agent ⌘6, Graph ⌘8, Insights ⌘9), MCP tool names consolidated (idea flow / graph sections). Device Sync and the native mobile app intentionally not headlined. |
| 2026-10-31 | v3.1.8 | Mobile Access (LAN browser companion) removed from the app: `docs/mobile.html` deleted and its "Mobile Companion" sidebar links and the PRD Generator "Next" card dropped. |
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
