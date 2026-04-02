# LLM Editor Pipeline Step — Design Spec

**Date:** 2026-04-02
**Status:** Approved

---

## Overview

Add an LLM-powered code-change step to the existing `POST /pipeline` endpoint. After TribeV2 inference runs, GPT-4o reads the `./landing-page-demo` React/Tailwind source files and produces two independent proposed versions of design changes. Each version is committed to its own git branch.

---

## Architecture

Follows the existing thin-handler pattern in `main.py`:

```
main.py
  └── POST /pipeline
        ├── record_scroll(url)                          → recorder.py (existing)
        ├── run_inference(video_path)                   → inference.py (existing)
        └── apply_llm_changes(tribe_result, repo_path) → llm_editor.py (new)
```

New file: `backend/llm_editor.py`

---

## API Change

`POST /pipeline` response gains a `branches` field:

```json
{
  "file": "recordings/abc.webm",
  "result": { "preds": [...], "segments": ... },
  "branches": ["llm-changes-1743600000-v1", "llm-changes-1743600000-v2"]
}
```

---

## Components

### `llm_editor.py`

`apply_llm_changes(tribe_result: dict, repo_path: str) -> list[str]`

1. **Read source files** — recursively find all `.tsx`, `.css`, `.html` files under `{repo_path}/src/`. Read each into a dict: `{ relative_path: contents }`.
2. **Generate v1** (conservative refinement):
   - `git checkout -b llm-changes-<ts>-v1` from main
   - Call GPT-4o with files + tribe result + conservative prompt
   - Parse JSON response `{ filepath: new_contents }`
   - Write each file to disk
   - `git add` changed files, `git commit`
3. **Generate v2** (bold redesign):
   - `git checkout main` first (so v2 branches from same base)
   - `git checkout -b llm-changes-<ts>-v2`
   - Call GPT-4o with files + tribe result + bold prompt
   - Parse JSON response, write files, commit
4. `git checkout main` to restore clean state
5. Return `["llm-changes-<ts>-v1", "llm-changes-<ts>-v2"]`

### GPT-4o Prompts

**System prompt (both calls):**
> You are a frontend design engineer. You will receive React/Tailwind source files and a UI analysis result. Return ONLY a JSON object mapping relative file paths to their complete new contents. No explanation, no markdown, just the JSON.

**User prompt v1 (conservative):**
> Here are the source files: `{files_json}`. Here is the UI analysis: `{tribe_result}`. Make conservative, targeted improvements to the design — improve spacing, typography, color contrast, and visual hierarchy. Keep the overall structure intact.

**User prompt v2 (bold):**
> Here are the source files: `{files_json}`. Here is the UI analysis: `{tribe_result}`. Make bold, creative redesign changes — rethink layout, visual style, and component structure to make this landing page significantly more compelling.

### `main.py` changes

- `POST /pipeline` calls `asyncio.to_thread(apply_llm_changes, tribe_result, "../landing-page-demo")` after inference
- Response model updated to include `branches: list[str]`

---

## Data Flow

```
POST /pipeline { url }
  → record_scroll(url) → recordings/<id>.webm
  → run_inference(.webm) → { preds, segments }
  → apply_llm_changes(tribe_result, "./landing-page-demo")
      → read .tsx/.css files from landing-page-demo/src/
      → git checkout -b llm-changes-<ts>-v1 (from main)
      → GPT-4o call #1 (conservative) → write files → git commit
      → git checkout main
      → git checkout -b llm-changes-<ts>-v2 (from main)
      → GPT-4o call #2 (bold) → write files → git commit
      → git checkout main
  → { file, result, branches: ["...-v1", "...-v2"] }
```

---

## Error Handling

- GPT-4o call fails → raise exception → `HTTP 500`
- GPT-4o returns malformed JSON → raise parse error → `HTTP 500`
- File write fails → raise exception → `HTTP 500`
- Git operations fail → raise exception → `HTTP 500`
- Partial state (one branch created, second fails): second branch is not created; first branch remains on disk
- `apply_llm_changes` is synchronous; wrapped in `asyncio.to_thread` in route handler

---

## Dependencies

- `openai` — add to `requirements.txt`
- `OPENAI_API_KEY` — must be set in environment
- `git` — system binary, must be available on the host

---

## Out of Scope

- Creating the initial landing page (assumed to exist with a `src/` directory)
- Displaying branch diffs in the frontend
- Cleaning up old branches
