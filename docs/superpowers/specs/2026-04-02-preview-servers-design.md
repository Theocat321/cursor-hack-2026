# Preview Servers — Design Spec

**Date:** 2026-04-02
**Status:** Approved

---

## Overview

Extend `POST /pipeline` to spawn two Vite dev servers — one per LLM-generated branch — on ports 6005 and 6006, record each with Playwright, run Tribe inference on each recording, and return preview URLs plus brain results. The frontend navigates to a `/preview` page with a 2x2 grid: iframes on top, brain output placeholders on the bottom.

---

## Architecture

```
main.py
  └── POST /pipeline
        ├── record_scroll(url)                      → recorder.py
        ├── run_inference(video_path)               → inference.py
        ├── apply_llm_changes(result, lp_path)      → llm_editor.py
        ├── start_previews(branches)                → preview_manager.py (new)
        ├── record_scroll("http://localhost:6005")  → recorder.py
        ├── run_inference(webm_v1)                  → inference.py
        ├── record_scroll("http://localhost:6006")  → recorder.py
        └── run_inference(webm_v2)                  → inference.py
```

New file: `backend/preview_manager.py`

---

## API Change

`POST /pipeline` response gains `preview_urls` and `brain_results` fields:

```json
{
  "file": "recordings/abc.webm",
  "result": { "preds": [...], "segments": ... },
  "branches": ["llm-changes-1743600000-v1", "llm-changes-1743600000-v2"],
  "preview_urls": ["http://localhost:6005", "http://localhost:6006"],
  "brain_results": [
    { "preds": [...], "segments": [...] },
    { "preds": [...], "segments": [...] }
  ]
}
```

---

## Backend: preview_manager.py

`start_previews(branches: list[str]) -> list[str]`

1. **Kill old processes** — terminate any previously stored Vite subprocesses
2. **Remove old worktrees** — `git worktree remove --force /tmp/preview-v1` and `/tmp/preview-v2`
3. For each branch (`v1` → port 6005, `v2` → port 6006):
   - `git worktree add /tmp/preview-<vN> <branch>`
   - Symlink `node_modules`: `ln -sfn <original_node_modules> /tmp/preview-<vN>/<relative_path>/node_modules`
   - Spawn `npx vite --port <port>` via `subprocess.Popen` in the worktree's `neurosplit-frontend/` directory
4. `time.sleep(1.5)` to give Vite time to bind
5. Store process handles in a module-level list for cleanup on next call
6. `time.sleep(2.0)` to give both Vite servers time to bind before Playwright records them
7. Return `["http://localhost:6005", "http://localhost:6006"]`

Paths:
- Original landing page: `<repo_root>/landing-page-demo/neurosplit-frontend/`
- Original node_modules: `<repo_root>/landing-page-demo/neurosplit-frontend/node_modules`
- Worktree v1: `/tmp/preview-v1/landing-page-demo/neurosplit-frontend/`
- Worktree v2: `/tmp/preview-v2/landing-page-demo/neurosplit-frontend/`

`start_previews` is synchronous, wrapped in `asyncio.to_thread` in the route handler.

---

## Frontend: Preview Page

New `/preview` route in the React frontend. After `POST /pipeline` completes, the app navigates to `/preview` passing `preview_urls` and `brain_results` via React Router state.

Layout: 2×2 grid. Top row is full height iframes; bottom row is smaller brain output placeholders.

```
┌──────────────────────┬──────────────────────┐
│  V1 — Conservative   │  V2 — Bold Redesign  │  ← ~65% height
│  <iframe :6005 />    │  <iframe :6006 />    │
├──────────────────────┼──────────────────────┤
│  Brain V1            │  Brain V2            │  ← ~35% height
│  (placeholder card   │  (placeholder card   │
│   showing preds/     │   showing preds/     │
│   segments JSON)     │   segments JSON)     │
└──────────────────────┴──────────────────────┘
```

Bottom cells render `brain_results[0]` and `brain_results[1]` as styled placeholder cards (raw JSON or summary stats) until a real visualization is designed.

---

## Error Handling

- **Ports in use by old previews:** Kill-and-replace clears them before spawning
- **Ports in use by something else:** Vite fails to bind → `Popen` process exits → `HTTP 500`
- **Worktree conflicts:** `git worktree remove --force` clears stale worktrees before creation
- **No cleanup on server shutdown:** Processes are OS-managed; kill-and-replace handles cleanup on next pipeline call

---

## Dependencies

- `git worktree` — system git, already required
- `npx vite` — available via `node_modules/.bin/vite` in the landing page project
- No new Python packages required

---

## Out of Scope

- Dynamic port allocation
- Cleanup on FastAPI shutdown
- Authentication or CORS configuration for the preview servers
