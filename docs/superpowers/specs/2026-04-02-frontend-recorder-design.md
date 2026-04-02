# Frontend Recorder — Design Spec

**Date:** 2026-04-02  
**Status:** Approved

---

## Overview

A lightweight Vite + React single-page app in `frontend/` that lets a user submit a URL, calls the FastAPI `POST /record` backend, and displays the result.

---

## Architecture

```
frontend/
  src/
    App.jsx       # URL input form, fetch call, result/error display
    main.jsx      # React entry point
  index.html
  vite.config.js  # dev proxy: /record → http://localhost:8000
  package.json
```

No router, no state library — plain React `useState`.

---

## API Call

```js
fetch('/record', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: inputValue })
})
```

The Vite dev proxy rewrites `/record` → `http://localhost:8000/record`, avoiding CORS issues during development.

---

## UI States

Single screen with four states managed by component state:

| State | What the user sees |
|---|---|
| Idle | URL text input + enabled "Record" button |
| Loading | URL input disabled, button shows "Recording…" and is disabled |
| Success | Green message: "Done! Saved to: `<file>`" |
| Error | Red message with error detail |

---

## Key Decisions

- **Vite + React** — fast dev server, minimal config, modern tooling
- **Vite proxy** — avoids CORS, no backend changes needed
- **No framework/router** — single page, single component, YAGNI
- **Success shows file path only** — video preview deferred to later pipeline stages
