# Preview Servers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `POST /pipeline` to spawn two Vite dev servers from git worktrees, re-record each with Playwright, run Tribe inference on each, and return `preview_urls` + `brain_results`; add a frontend 2×2 preview page with iframes on top and brain placeholders on the bottom.

**Architecture:** New `backend/preview_manager.py` handles worktree creation, node_modules symlinking, and Vite process management. `main.py` chains `start_previews` then re-runs record+inference for each URL. The frontend gains a `PreviewPage` component rendered conditionally when a new "Run Pipeline" button succeeds.

**Tech Stack:** Python subprocess/os (worktrees, Popen, symlinks), React + Vitest + @testing-library/react, Tailwind CSS

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/preview_manager.py` | Create | Kill old procs, create worktrees, symlink node_modules, spawn Vite |
| `backend/tests/test_preview_manager.py` | Create | Unit tests for preview_manager |
| `backend/main.py` | Modify | Add start_previews + brain re-run to /pipeline |
| `backend/tests/test_pipeline.py` | Modify | Mock start_previews, test preview_urls + brain_results |
| `frontend/src/PreviewPage.jsx` | Create | 2×2 grid: iframes top, brain placeholders bottom |
| `frontend/src/App.jsx` | Modify | Add Run Pipeline button + conditional PreviewPage render |
| `frontend/src/App.test.jsx` | Modify | Tests for pipeline button and PreviewPage render |

---

### Task 1: Write failing tests for preview_manager

**Files:**
- Create: `backend/tests/test_preview_manager.py`

- [ ] **Step 1: Create the test file**

```python
# backend/tests/test_preview_manager.py
import sys
from unittest.mock import MagicMock, patch
import pytest

# Patch tribev2 so any indirect main.py imports don't fail
mock_tribe_module = MagicMock()
mock_tribe_module.TribeModel.from_pretrained.return_value = MagicMock()
sys.modules["tribev2"] = mock_tribe_module

import preview_manager  # noqa: E402


@pytest.fixture(autouse=True)
def reset_state():
    preview_manager._preview_procs = []
    preview_manager._repo_root = None
    yield
    preview_manager._preview_procs = []
    preview_manager._repo_root = None


def test_start_previews_returns_two_urls():
    with patch("preview_manager.subprocess.run"), \
         patch("preview_manager.subprocess.Popen") as mock_popen, \
         patch("preview_manager.os.symlink"), \
         patch("preview_manager.time.sleep"):
        mock_popen.return_value = MagicMock()
        urls = preview_manager.start_previews(["branch-v1", "branch-v2"])

    assert urls == ["http://localhost:6005", "http://localhost:6006"]


def test_start_previews_spawns_two_vite_processes():
    with patch("preview_manager.subprocess.run"), \
         patch("preview_manager.subprocess.Popen") as mock_popen, \
         patch("preview_manager.os.symlink"), \
         patch("preview_manager.time.sleep"):
        mock_popen.return_value = MagicMock()
        preview_manager.start_previews(["branch-v1", "branch-v2"])

    assert mock_popen.call_count == 2


def test_start_previews_uses_correct_ports():
    popen_cmds = []

    def capture(cmd, **kwargs):
        popen_cmds.append(cmd)
        return MagicMock()

    with patch("preview_manager.subprocess.run"), \
         patch("preview_manager.subprocess.Popen", side_effect=capture), \
         patch("preview_manager.os.symlink"), \
         patch("preview_manager.time.sleep"):
        preview_manager.start_previews(["branch-v1", "branch-v2"])

    ports = [cmd[cmd.index("--port") + 1] for cmd in popen_cmds]
    assert ports == ["6005", "6006"]


def test_start_previews_terminates_old_processes():
    old_proc = MagicMock()
    preview_manager._preview_procs = [old_proc]

    with patch("preview_manager.subprocess.run"), \
         patch("preview_manager.subprocess.Popen") as mock_popen, \
         patch("preview_manager.os.symlink"), \
         patch("preview_manager.time.sleep"):
        mock_popen.return_value = MagicMock()
        preview_manager.start_previews(["branch-v1", "branch-v2"])

    old_proc.terminate.assert_called_once()


def test_start_previews_creates_git_worktrees():
    with patch("preview_manager.subprocess.run") as mock_run, \
         patch("preview_manager.subprocess.Popen") as mock_popen, \
         patch("preview_manager.os.symlink"), \
         patch("preview_manager.time.sleep"):
        mock_popen.return_value = MagicMock()
        preview_manager.start_previews(["branch-v1", "branch-v2"])

    cmds = [c.args[0] for c in mock_run.call_args_list]
    worktree_adds = [c for c in cmds if "worktree" in c and "add" in c]
    assert len(worktree_adds) == 2
    assert any("branch-v1" in c for c in worktree_adds)
    assert any("branch-v2" in c for c in worktree_adds)


def test_start_previews_symlinks_node_modules():
    symlink_calls = []

    def capture_symlink(src, dst):
        symlink_calls.append((src, dst))

    with patch("preview_manager.subprocess.run"), \
         patch("preview_manager.subprocess.Popen") as mock_popen, \
         patch("preview_manager.os.symlink", side_effect=capture_symlink), \
         patch("preview_manager.time.sleep"):
        mock_popen.return_value = MagicMock()
        preview_manager.start_previews(["branch-v1", "branch-v2"])

    assert len(symlink_calls) == 2
    # Both point to the same original node_modules
    assert symlink_calls[0][0] == symlink_calls[1][0]
    # Different destinations (different worktrees)
    assert symlink_calls[0][1] != symlink_calls[1][1]
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd backend && .venv/bin/python -m pytest tests/test_preview_manager.py -v 2>&1 | head -15
```

Expected: `ModuleNotFoundError: No module named 'preview_manager'`

- [ ] **Step 3: Commit**

```bash
git add backend/tests/test_preview_manager.py
git commit -m "test: add failing tests for preview_manager"
```

---

### Task 2: Implement preview_manager.py

**Files:**
- Create: `backend/preview_manager.py`

- [ ] **Step 1: Write the implementation**

```python
# backend/preview_manager.py
import os
import subprocess
import time
from pathlib import Path

_preview_procs: list = []
_repo_root: str | None = None

_PORTS = [6005, 6006]
_WORKTREES = ["/tmp/preview-v1", "/tmp/preview-v2"]
_VITE_SUBPATH = "landing-page-demo/neurosplit-frontend"


def start_previews(branches: list[str]) -> list[str]:
    global _repo_root
    _repo_root = str(Path(__file__).parent.parent)

    _cleanup()

    original_nm = str(Path(_repo_root) / _VITE_SUBPATH / "node_modules")
    vite_bin = str(Path(_repo_root) / _VITE_SUBPATH / "node_modules" / ".bin" / "vite")

    for branch, worktree, port in zip(branches, _WORKTREES, _PORTS):
        subprocess.run(
            ["git", "-C", _repo_root, "worktree", "add", worktree, branch],
            check=True,
            capture_output=True,
        )

        nm_dst = Path(worktree) / _VITE_SUBPATH / "node_modules"
        if nm_dst.exists() or nm_dst.is_symlink():
            nm_dst.unlink()
        os.symlink(original_nm, str(nm_dst))

        proc = subprocess.Popen(
            [vite_bin, "--port", str(port), "--strictPort"],
            cwd=str(Path(worktree) / _VITE_SUBPATH),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        _preview_procs.append(proc)

    time.sleep(2.0)
    return [f"http://localhost:{port}" for port in _PORTS]


def _cleanup():
    global _preview_procs
    for proc in _preview_procs:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()
    _preview_procs = []

    if _repo_root:
        for worktree in _WORKTREES:
            subprocess.run(
                ["git", "-C", _repo_root, "worktree", "remove", "--force", worktree],
                capture_output=True,
            )
```

- [ ] **Step 2: Run tests**

```bash
cd backend && .venv/bin/python -m pytest tests/test_preview_manager.py -v
```

Expected: All 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add backend/preview_manager.py
git commit -m "feat: add preview_manager with start_previews"
```

---

### Task 3: Update main.py and test_pipeline.py

**Files:**
- Modify: `backend/main.py`
- Modify: `backend/tests/test_pipeline.py`

- [ ] **Step 1: Write the updated main.py**

```python
# backend/main.py
import asyncio
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from inference import run_inference
from llm_editor import apply_llm_changes
from preview_manager import start_previews
from recorder import record_scroll

app = FastAPI()

LANDING_PAGE_PATH = str(Path(__file__).parent.parent / "landing-page-demo")


class RecordRequest(BaseModel):
    url: str


@app.post("/record")
async def record(request: RecordRequest):
    try:
        file_path = await record_scroll(request.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"file": file_path}


@app.post("/pipeline")
async def pipeline(request: RecordRequest):
    try:
        file_path = await record_scroll(request.url)
        result = await asyncio.to_thread(run_inference, file_path)
        branches = await asyncio.to_thread(apply_llm_changes, result, LANDING_PAGE_PATH)
        preview_urls = await asyncio.to_thread(start_previews, branches)
        brain_results = []
        for url in preview_urls:
            vf = await record_scroll(url)
            br = await asyncio.to_thread(run_inference, vf)
            brain_results.append(br)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {
        "file": file_path,
        "result": result,
        "branches": branches,
        "preview_urls": preview_urls,
        "brain_results": brain_results,
    }
```

- [ ] **Step 2: Write the updated test_pipeline.py**

```python
# backend/tests/test_pipeline.py
import sys
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import AsyncClient, ASGITransport

mock_tribe_module = MagicMock()
mock_tribe_module.TribeModel.from_pretrained.return_value = MagicMock()
sys.modules["tribev2"] = mock_tribe_module

from main import app  # noqa: E402


@pytest.mark.asyncio
async def test_pipeline_returns_file_and_result():
    fake_result = {"preds": [[0.1, 0.2]], "segments": [{"start": 0, "end": 1}]}
    fake_branches = ["llm-changes-100-v1", "llm-changes-100-v2"]
    fake_urls = ["http://localhost:6005", "http://localhost:6006"]

    with patch("main.record_scroll", new_callable=AsyncMock, return_value="recordings/test.webm"), \
         patch("main.run_inference", return_value=fake_result), \
         patch("main.apply_llm_changes", return_value=fake_branches), \
         patch("main.start_previews", return_value=fake_urls):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/pipeline", json={"url": "https://example.com"})

    assert response.status_code == 200
    body = response.json()
    assert body["file"] == "recordings/test.webm"
    assert body["result"] == fake_result


@pytest.mark.asyncio
async def test_pipeline_returns_branches():
    fake_result = {"preds": [[0.1]], "segments": []}
    fake_branches = ["llm-changes-100-v1", "llm-changes-100-v2"]
    fake_urls = ["http://localhost:6005", "http://localhost:6006"]

    with patch("main.record_scroll", new_callable=AsyncMock, return_value="recordings/test.webm"), \
         patch("main.run_inference", return_value=fake_result), \
         patch("main.apply_llm_changes", return_value=fake_branches), \
         patch("main.start_previews", return_value=fake_urls):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/pipeline", json={"url": "https://example.com"})

    assert response.status_code == 200
    assert response.json()["branches"] == fake_branches


@pytest.mark.asyncio
async def test_pipeline_returns_preview_urls_and_brain_results():
    fake_result = {"preds": [[0.1]], "segments": []}
    fake_branches = ["llm-changes-100-v1", "llm-changes-100-v2"]
    fake_urls = ["http://localhost:6005", "http://localhost:6006"]

    with patch("main.record_scroll", new_callable=AsyncMock, return_value="recordings/test.webm"), \
         patch("main.run_inference", return_value=fake_result), \
         patch("main.apply_llm_changes", return_value=fake_branches), \
         patch("main.start_previews", return_value=fake_urls):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/pipeline", json={"url": "https://example.com"})

    body = response.json()
    assert body["preview_urls"] == fake_urls
    assert len(body["brain_results"]) == 2


@pytest.mark.asyncio
async def test_pipeline_returns_500_on_record_error():
    with patch("main.record_scroll", new_callable=AsyncMock, side_effect=Exception("browser crashed")):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/pipeline", json={"url": "https://example.com"})

    assert response.status_code == 500
    assert "browser crashed" in response.json()["detail"]


@pytest.mark.asyncio
async def test_pipeline_returns_500_on_inference_error():
    with patch("main.record_scroll", new_callable=AsyncMock, return_value="recordings/test.webm"), \
         patch("main.run_inference", side_effect=RuntimeError("model failed")):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/pipeline", json={"url": "https://example.com"})

    assert response.status_code == 500
    assert "model failed" in response.json()["detail"]


@pytest.mark.asyncio
async def test_pipeline_returns_500_on_llm_error():
    fake_result = {"preds": [[0.1]], "segments": []}

    with patch("main.record_scroll", new_callable=AsyncMock, return_value="recordings/test.webm"), \
         patch("main.run_inference", return_value=fake_result), \
         patch("main.apply_llm_changes", side_effect=RuntimeError("GPT error")):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/pipeline", json={"url": "https://example.com"})

    assert response.status_code == 500
    assert "GPT error" in response.json()["detail"]


@pytest.mark.asyncio
async def test_pipeline_returns_500_on_preview_error():
    fake_result = {"preds": [[0.1]], "segments": []}
    fake_branches = ["llm-changes-100-v1", "llm-changes-100-v2"]

    with patch("main.record_scroll", new_callable=AsyncMock, return_value="recordings/test.webm"), \
         patch("main.run_inference", return_value=fake_result), \
         patch("main.apply_llm_changes", return_value=fake_branches), \
         patch("main.start_previews", side_effect=RuntimeError("vite failed")):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/pipeline", json={"url": "https://example.com"})

    assert response.status_code == 500
    assert "vite failed" in response.json()["detail"]
```

- [ ] **Step 3: Run all backend tests**

```bash
cd backend && .venv/bin/python -m pytest tests/ -v
```

Expected: All tests PASS (preview_manager + pipeline + inference + llm_editor).

- [ ] **Step 4: Commit**

```bash
git add backend/main.py backend/tests/test_pipeline.py
git commit -m "feat: extend /pipeline with preview servers and brain re-run"
```

---

### Task 4: Create PreviewPage.jsx

**Files:**
- Create: `frontend/src/PreviewPage.jsx`

- [ ] **Step 1: Write the component**

```jsx
// frontend/src/PreviewPage.jsx
export default function PreviewPage({ previewUrls, brainResults }) {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 p-1 gap-1">
      <div className="flex gap-1 flex-[65]">
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-white">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-100 bg-slate-50 shrink-0">
            V1 — Conservative
          </div>
          <iframe
            src={previewUrls[0]}
            className="flex-1 w-full border-0"
            title="V1 Conservative"
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-white">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-100 bg-slate-50 shrink-0">
            V2 — Bold Redesign
          </div>
          <iframe
            src={previewUrls[1]}
            className="flex-1 w-full border-0"
            title="V2 Bold Redesign"
          />
        </div>
      </div>
      <div className="flex gap-1 flex-[35]">
        <div className="flex-1 overflow-auto rounded-xl bg-slate-800 p-3">
          <p className="text-xs font-semibold text-slate-400 mb-2">Brain V1</p>
          <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all">
            {JSON.stringify(brainResults[0], null, 2)}
          </pre>
        </div>
        <div className="flex-1 overflow-auto rounded-xl bg-slate-800 p-3">
          <p className="text-xs font-semibold text-slate-400 mb-2">Brain V2</p>
          <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all">
            {JSON.stringify(brainResults[1], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/PreviewPage.jsx
git commit -m "feat: add PreviewPage 2x2 grid component"
```

---

### Task 5: Update App.jsx and App.test.jsx

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/App.test.jsx`

- [ ] **Step 1: Write the updated App.jsx**

Add `pipelineLoading`, `pipelineError`, `previewData` states. Add `handleRunPipeline`. Render `PreviewPage` when `previewData` is set. Add "Run Pipeline" button alongside the existing "Record" button.

```jsx
// frontend/src/App.jsx
import { useEffect, useState } from 'react'
import PreviewPage from './PreviewPage.jsx'

const STYLE_GUIDELINES_KEY = 'recorder-style-guidelines'

function loadGuidelines() {
  try {
    return localStorage.getItem(STYLE_GUIDELINES_KEY) ?? ''
  } catch {
    return ''
  }
}

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [styleGuidelines, setStyleGuidelines] = useState(loadGuidelines)

  const [testLoading, setTestLoading] = useState(false)
  const [testError, setTestError] = useState(null)
  const [testPayload, setTestPayload] = useState(null)

  const [pipelineLoading, setPipelineLoading] = useState(false)
  const [pipelineError, setPipelineError] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STYLE_GUIDELINES_KEY, styleGuidelines)
    } catch {
      /* ignore quota / private mode */
    }
  }, [styleGuidelines])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Something went wrong')
      } else {
        setResult(data.file)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRunPipeline() {
    setPipelineLoading(true)
    setPipelineError(null)

    try {
      const res = await fetch('/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (!res.ok) {
        setPipelineError(data.detail || 'Pipeline failed')
      } else {
        setPreviewData(data)
      }
    } catch (err) {
      setPipelineError(err.message)
    } finally {
      setPipelineLoading(false)
    }
  }

  async function handleTestComparison() {
    setTestLoading(true)
    setTestError(null)
    setTestPayload(null)

    try {
      const res = await fetch('/test')
      const data = await res.json()

      if (!res.ok) {
        setTestError(data.detail || 'Test request failed')
      } else {
        setTestPayload(data)
      }
    } catch (err) {
      setTestError(err.message)
    } finally {
      setTestLoading(false)
    }
  }

  if (previewData) {
    return (
      <PreviewPage
        previewUrls={previewData.preview_urls}
        brainResults={previewData.brain_results}
      />
    )
  }

  const variants = testPayload?.variants ?? []

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <div
        className={`mx-auto px-4 py-12 sm:py-16 ${variants.length ? 'max-w-6xl' : 'max-w-lg'}`}
      >
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
            Recorder
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Capture a URL session and save the recording.
          </p>
        </header>

        <section
          className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60"
          aria-labelledby="style-guidelines-heading"
        >
          <h2
            id="style-guidelines-heading"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Style guidelines
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Describe typography, color, spacing, or tone. Saved in this browser and meant to guide
            frontend changes.
          </p>
          <label htmlFor="style-guidelines" className="sr-only">
            User style guidelines for the frontend
          </label>
          <textarea
            id="style-guidelines"
            value={styleGuidelines}
            onChange={(e) => setStyleGuidelines(e.target.value)}
            placeholder="e.g. Prefer a calm editorial look: plenty of whitespace, serif headings, accent #2563eb, no harsh borders…"
            rows={5}
            className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          />
        </section>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="record-url" className="mb-1.5 block text-sm font-medium text-slate-700">
                Page URL
              </label>
              <input
                id="record-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading || pipelineLoading}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="submit"
                disabled={loading || pipelineLoading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[7rem]"
              >
                {loading ? 'Recording…' : 'Record'}
              </button>
              <button
                type="button"
                onClick={handleRunPipeline}
                disabled={loading || pipelineLoading || !url}
                className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {pipelineLoading ? 'Running pipeline…' : 'Run Pipeline'}
              </button>
              <button
                type="button"
                onClick={handleTestComparison}
                disabled={testLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {testLoading ? 'Loading test…' : 'Test comparison (2 previews)'}
              </button>
            </div>
          </form>

          {result && (
            <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Done! Saved to: <span className="font-mono text-emerald-950">{result}</span>
            </p>
          )}

          {error && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              Error: {error}
            </p>
          )}

          {pipelineError && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              Pipeline error: {pipelineError}
            </p>
          )}

          {testError && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              Test error: {testError}
            </p>
          )}
        </div>

        {variants.length > 0 && (
          <section
            className="mt-10"
            aria-label="Comparison previews and brain activation maps"
          >
            <h2 className="mb-4 text-center text-lg font-semibold text-slate-800">
              Side-by-side previews
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {variants.map((v) => (
                <article
                  key={v.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/50"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-800">{v.title}</h3>
                    <p className="text-xs text-slate-500">Activation map (demo) + embedded preview</p>
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex justify-center rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/80">
                      <img
                        src={v.brainImageUrl}
                        alt={`Demo brain activation for ${v.title}`}
                        className="h-36 w-auto max-w-full object-contain"
                        width={240}
                        height={200}
                      />
                    </div>
                    <div className="overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
                      <iframe
                        title={`Preview ${v.id}`}
                        src={v.iframeUrl}
                        className="h-[min(22rem,50vh)] w-full border-0 bg-white"
                        sandbox="allow-same-origin allow-scripts"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {testPayload?.tribeNote && (
              <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50/90 px-4 py-3 text-xs leading-relaxed text-amber-950">
                <strong className="font-semibold">TRIBE v2:</strong> {testPayload.tribeNote}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write the updated App.test.jsx**

Add two new tests at the bottom of the existing describe block. Keep all existing tests unchanged.

```jsx
// frontend/src/App.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App.jsx'

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders URL input and Record button', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Record' })).toBeInTheDocument()
  })

  it('disables input and button while recording', async () => {
    let resolveFetch
    vi.spyOn(global, 'fetch').mockReturnValueOnce(
      new Promise((res) => { resolveFetch = res })
    )

    render(<App />)
    const input = screen.getByPlaceholderText('https://example.com')
    const button = screen.getByRole('button', { name: 'Record' })

    await userEvent.type(input, 'https://example.com')
    userEvent.click(button) // intentionally not awaited — fetch is pending

    await waitFor(() => expect(button).toBeDisabled())
    expect(input).toBeDisabled()

    // clean up — resolve the pending fetch
    resolveFetch({ ok: true, json: async () => ({ file: 'recordings/abc.webm' }) })
  })

  it('shows success message with file path on completion', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ file: 'recordings/abc.webm' }),
    })

    render(<App />)
    await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Record' }))

    await waitFor(() => {
      expect(screen.getByText('Done! Saved to:')).toBeInTheDocument()
      expect(screen.getByText('recordings/abc.webm')).toBeInTheDocument()
    })
  })

  it('shows error message when fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'browser crashed' }),
    })

    render(<App />)
    await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Record' }))

    await waitFor(() =>
      expect(screen.getByText(/browser crashed/)).toBeInTheDocument()
    )
  })

  it('loads test comparison and shows two preview panes', async () => {
    const testBody = {
      variants: [
        {
          id: 'a',
          title: 'Version A',
          iframeUrl: '/test-preview/a',
          brainImageUrl: 'data:image/svg+xml;base64,PHN2Zy8+',
        },
        {
          id: 'b',
          title: 'Version B',
          iframeUrl: '/test-preview/b',
          brainImageUrl: 'data:image/svg+xml;base64,PHN2Zy8+',
        },
      ],
      tribeNote: 'TRIBE note for tests.',
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => testBody,
    })

    render(<App />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Test comparison (2 previews)' })
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /side-by-side previews/i })).toBeInTheDocument()
      expect(screen.getByTitle('Preview a')).toBeInTheDocument()
      expect(screen.getByTitle('Preview b')).toBeInTheDocument()
      expect(screen.getByText(/TRIBE note for tests/)).toBeInTheDocument()
    })
  })

  it('renders Run Pipeline button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Run Pipeline' })).toBeInTheDocument()
  })

  it('shows PreviewPage when pipeline succeeds', async () => {
    const pipelineResponse = {
      file: 'recordings/abc.webm',
      result: { preds: [[0.1]], segments: [] },
      branches: ['llm-changes-100-v1', 'llm-changes-100-v2'],
      preview_urls: ['http://localhost:6005', 'http://localhost:6006'],
      brain_results: [
        { preds: [[0.2]], segments: [] },
        { preds: [[0.3]], segments: [] },
      ],
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => pipelineResponse,
    })

    render(<App />)
    await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Run Pipeline' }))

    await waitFor(() => {
      expect(screen.getByTitle('V1 Conservative')).toBeInTheDocument()
      expect(screen.getByTitle('V2 Bold Redesign')).toBeInTheDocument()
      expect(screen.getByText('Brain V1')).toBeInTheDocument()
      expect(screen.getByText('Brain V2')).toBeInTheDocument()
    })
  })

  it('shows pipeline error when pipeline fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'pipeline exploded' }),
    })

    render(<App />)
    await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Run Pipeline' }))

    await waitFor(() =>
      expect(screen.getByText(/pipeline exploded/)).toBeInTheDocument()
    )
  })
})
```

- [ ] **Step 3: Run frontend tests**

```bash
cd frontend && npm test 2>&1
```

Expected: All tests PASS including the 2 new ones (`renders Run Pipeline button`, `shows PreviewPage when pipeline succeeds`, `shows pipeline error when pipeline fails`).

- [ ] **Step 4: Run full backend test suite to confirm nothing broken**

```bash
cd backend && .venv/bin/python -m pytest tests/ -v
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.jsx frontend/src/App.test.jsx
git commit -m "feat: add Run Pipeline button and PreviewPage 2x2 grid"
```
