# Backend Recorder — Design Spec

**Date:** 2026-04-02  
**Status:** Approved

---

## Overview

A FastAPI backend that accepts a URL, uses Playwright to open it in a headless Chromium browser, scrolls the page, records the session as a video, and returns the saved file path. This is the first stage of a larger QA/review pipeline.

---

## Architecture

Single FastAPI app in `backend/`. Two Python modules, one output directory.

```
backend/
  main.py          # FastAPI app and route definitions
  recorder.py      # Playwright scroll-and-record logic
  recordings/      # saved .webm video files (gitignored)
  requirements.txt
```

---

## API

### `POST /record`

**Request body:**
```json
{ "url": "https://example.com" }
```

**Success response (200):**
```json
{ "file": "recordings/abc123.webm" }
```

**Error responses:**
- `400` — invalid or unreachable URL
- `500` — Playwright crash with error detail

---

## Data Flow

1. Request hits `POST /record` with a URL
2. Handler calls `recorder.py`
3. Playwright launches headless Chromium with video recording enabled
4. Page is opened and scrolls smoothly to the bottom
5. Browser closes, flushing the `.webm` file to `recordings/`
6. File path returned in response

---

## Key Decisions

- **Synchronous endpoint** — blocks until recording completes. No background tasks or polling needed for a pipeline tool.
- **Playwright** — chosen for built-in video recording and scroll automation.
- **Fail fast** — no retries. Invalid URLs or crashes return errors immediately; caller handles recovery.
- **Output format** — `.webm` (Playwright default). File path returned for downstream pipeline stages to consume.

---

## Dependencies

- `fastapi`
- `uvicorn`
- `playwright` (+ `playwright install chromium`)
- `pydantic`
