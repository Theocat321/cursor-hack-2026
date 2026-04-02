# Pipeline Endpoint Design

**Date:** 2026-04-02
**Status:** Approved

## Overview

Add a `POST /pipeline` endpoint to the existing FastAPI backend. It chains two steps: (1) record a browser scroll session as a video, then (2) run that video through Meta TribeV2 for event prediction. The caller receives both the saved video path and the model's output.

## Architecture

The existing pattern is thin route handlers in `main.py` delegating to focused modules (`recorder.py`). This design follows that same pattern by adding a new `inference.py` module.

```
main.py
  └── POST /pipeline
        ├── record_scroll(url)        → recorder.py (existing)
        └── run_inference(video_path) → inference.py (new)
```

## Components

### `POST /pipeline` (main.py)

- Request body: `{ "url": str }` — reuses existing `RecordRequest` model
- Calls `record_scroll(url)` to get a `.webm` file path
- Calls `run_inference(video_path)` with that path
- Returns: `{ "file": str, "result": { "preds": list, "segments": <segments> } }`
- Errors from either step surface as `HTTP 500` with the exception message

### `inference.py` (new)

- `TribeModel` is loaded **once at module level** on startup via `TribeModel.from_pretrained("facebook/tribev2", cache_folder="./cache")` — not per-request
- `run_inference(video_path: str) -> dict`:
  1. Converts the `.webm` file to `.mp4` using `ffmpeg` via `subprocess`
  2. Calls `model.get_events_dataframe(video_path=mp4_path)`
  3. Calls `model.predict(events=df)`
  4. Cleans up the temp `.mp4` file
  5. Returns `{ "preds": preds.tolist(), "segments": segments }`

## Data Flow

```
Client → POST /pipeline { url }
  → record_scroll(url) → recordings/<id>.webm
  → run_inference(.webm path)
      → ffmpeg: .webm → /tmp/<id>.mp4
      → TribeModel.get_events_dataframe(mp4_path)
      → TribeModel.predict(events=df)
      → cleanup /tmp/<id>.mp4
  → { file: ".webm path", result: { preds: [...], segments: ... } }
```

## Dependencies

- **`tribev2`** — add to `requirements.txt`
- **`ffmpeg`** — system binary, must be installed on the host (not a Python package)

## Error Handling

- `record_scroll` failures raise an exception caught by the route handler → `HTTP 500`
- `ffmpeg` conversion failure raises an exception → `HTTP 500`
- `TribeModel` inference failure raises an exception → `HTTP 500`
- Temp `.mp4` cleanup happens in a `finally` block so it always runs even on error

## Async Consideration

`TribeModel.predict` is synchronous. Since the `/pipeline` route is `async def`, the inference call must be wrapped with `asyncio.to_thread(run_inference, video_path)` in the route handler to avoid blocking the event loop.

## Out of Scope

- Caching inference results
- Model reload / hot-swap
