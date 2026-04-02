# Pipeline Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `POST /pipeline` endpoint that records a browser scroll session and runs the video through Meta TribeV2 for event prediction, returning the video path and model output.

**Architecture:** A new `inference.py` module loads `TribeModel` once at startup, converts `.webm` → `.mp4` with ffmpeg, and runs prediction. `main.py` gains a `/pipeline` route that chains `record_scroll()` → `run_inference()` via `asyncio.to_thread`.

**Tech Stack:** FastAPI, Playwright, TribeV2 (`tribev2`), ffmpeg (system binary), pytest, pytest-asyncio, httpx

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `backend/inference.py` | TribeModel load + `.webm→.mp4` conversion + predict |
| Modify | `backend/main.py` | Add `/pipeline` route |
| Modify | `backend/requirements.txt` | Add `tribev2` |
| Create | `backend/tests/__init__.py` | Make tests a package |
| Create | `backend/tests/test_inference.py` | Unit tests for `run_inference` |
| Create | `backend/tests/test_pipeline.py` | Integration tests for `POST /pipeline` |

---

### Task 1: Add `tribev2` to requirements

**Files:**
- Modify: `backend/requirements.txt`

- [ ] **Step 1: Add the dependency**

Open `backend/requirements.txt` and add:

```
tribev2
```

Final file should look like:

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
playwright==1.44.0
pydantic==2.7.1
pytest==8.2.0
pytest-asyncio==0.23.6
httpx==0.27.0
tribev2
```

- [ ] **Step 2: Commit**

```bash
git add backend/requirements.txt
git commit -m "chore: add tribev2 dependency"
```

---

### Task 2: Create `inference.py` with failing tests first

**Files:**
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/test_inference.py`
- Create: `backend/inference.py`

- [ ] **Step 1: Create the tests package**

Create `backend/tests/__init__.py` as an empty file.

- [ ] **Step 2: Write the failing test for `run_inference`**

Create `backend/tests/test_inference.py`:

```python
import sys
import os
import numpy as np
import pytest
from unittest.mock import MagicMock, patch, call

# Patch tribev2 at import time so inference.py can be imported without the real library
mock_tribe_module = MagicMock()
mock_model_instance = MagicMock()
mock_tribe_module.TribeModel.from_pretrained.return_value = mock_model_instance
sys.modules["tribev2"] = mock_tribe_module

import inference  # noqa: E402


def setup_function():
    mock_model_instance.reset_mock(side_effect=True, return_value=True)


def test_run_inference_returns_preds_and_segments(tmp_path):
    fake_webm = tmp_path / "recording.webm"
    fake_webm.write_bytes(b"fake video data")

    mock_df = MagicMock()
    mock_preds = np.zeros((10, 5))
    mock_segments = [{"start": 0, "end": 1}]

    mock_model_instance.get_events_dataframe.return_value = mock_df
    mock_model_instance.predict.return_value = (mock_preds, mock_segments)

    with patch("inference.subprocess.run") as mock_subprocess:
        mock_subprocess.return_value = MagicMock(returncode=0)
        result = inference.run_inference(str(fake_webm))

    assert result["preds"] == mock_preds.tolist()
    assert result["segments"] == mock_segments


def test_run_inference_cleans_up_mp4_on_success(tmp_path):
    fake_webm = tmp_path / "recording.webm"
    fake_webm.write_bytes(b"fake video data")

    mock_model_instance.get_events_dataframe.return_value = MagicMock()
    mock_model_instance.predict.return_value = (np.zeros((5, 3)), [])

    created_mp4 = []

    def fake_subprocess_run(cmd, **kwargs):
        # Simulate ffmpeg creating the output file
        mp4_path = cmd[-1]
        created_mp4.append(mp4_path)
        open(mp4_path, "wb").close()
        return MagicMock(returncode=0)

    with patch("inference.subprocess.run", side_effect=fake_subprocess_run):
        inference.run_inference(str(fake_webm))

    assert len(created_mp4) == 1
    assert not os.path.exists(created_mp4[0])  # cleaned up


def test_run_inference_cleans_up_mp4_on_error(tmp_path):
    fake_webm = tmp_path / "recording.webm"
    fake_webm.write_bytes(b"fake video data")

    created_mp4 = []

    def fake_subprocess_run(cmd, **kwargs):
        mp4_path = cmd[-1]
        created_mp4.append(mp4_path)
        open(mp4_path, "wb").close()
        return MagicMock(returncode=0)

    mock_model_instance.get_events_dataframe.side_effect = RuntimeError("model failed")

    with patch("inference.subprocess.run", side_effect=fake_subprocess_run):
        with pytest.raises(RuntimeError, match="model failed"):
            inference.run_inference(str(fake_webm))

    assert not os.path.exists(created_mp4[0])  # still cleaned up


def test_run_inference_ffmpeg_failure_raises(tmp_path):
    fake_webm = tmp_path / "recording.webm"
    fake_webm.write_bytes(b"fake video data")

    import subprocess
    with patch("inference.subprocess.run", side_effect=subprocess.CalledProcessError(1, "ffmpeg")):
        with pytest.raises(subprocess.CalledProcessError):
            inference.run_inference(str(fake_webm))
```

- [ ] **Step 3: Run tests — expect ImportError (inference.py doesn't exist yet)**

```bash
cd backend && python -m pytest tests/test_inference.py -v
```

Expected: `ModuleNotFoundError: No module named 'inference'`

- [ ] **Step 4: Create `backend/inference.py`**

```python
import os
import subprocess
import tempfile

from tribev2 import TribeModel

model = TribeModel.from_pretrained("facebook/tribev2", cache_folder="./cache")


def run_inference(video_path: str) -> dict:
    mp4_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            mp4_path = tmp.name

        subprocess.run(
            ["ffmpeg", "-y", "-i", video_path, mp4_path],
            capture_output=True,
            check=True,
        )

        df = model.get_events_dataframe(video_path=mp4_path)
        preds, segments = model.predict(events=df)
        return {"preds": preds.tolist(), "segments": segments}
    finally:
        if mp4_path and os.path.exists(mp4_path):
            os.remove(mp4_path)
```

- [ ] **Step 5: Run tests — expect all pass**

```bash
cd backend && python -m pytest tests/test_inference.py -v
```

Expected:
```
tests/test_inference.py::test_run_inference_returns_preds_and_segments PASSED
tests/test_inference.py::test_run_inference_cleans_up_mp4_on_success PASSED
tests/test_inference.py::test_run_inference_cleans_up_mp4_on_error PASSED
tests/test_inference.py::test_run_inference_ffmpeg_failure_raises PASSED
4 passed
```

- [ ] **Step 6: Commit**

```bash
git add backend/inference.py backend/tests/__init__.py backend/tests/test_inference.py
git commit -m "feat: add inference.py with TribeV2 model and webm->mp4 conversion"
```

---

### Task 3: Add `/pipeline` route to `main.py`

**Files:**
- Create: `backend/tests/test_pipeline.py`
- Modify: `backend/main.py`

- [ ] **Step 1: Write the failing test for `/pipeline`**

Create `backend/tests/test_pipeline.py`:

```python
import sys
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Patch tribev2 before importing anything that touches inference
mock_tribe_module = MagicMock()
mock_tribe_module.TribeModel.from_pretrained.return_value = MagicMock()
sys.modules["tribev2"] = mock_tribe_module

from main import app  # noqa: E402


@pytest.mark.asyncio
async def test_pipeline_returns_file_and_result():
    fake_result = {"preds": [[0.1, 0.2], [0.3, 0.4]], "segments": [{"start": 0, "end": 1}]}

    with patch("main.record_scroll", new_callable=AsyncMock, return_value="recordings/test.webm"), \
         patch("main.run_inference", return_value=fake_result):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/pipeline", json={"url": "https://example.com"})

    assert response.status_code == 200
    body = response.json()
    assert body["file"] == "recordings/test.webm"
    assert body["result"] == fake_result


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
```

- [ ] **Step 2: Run tests — expect failure (route doesn't exist yet)**

```bash
cd backend && python -m pytest tests/test_pipeline.py -v
```

Expected: `404 Not Found` or assertion errors because `/pipeline` doesn't exist.

- [ ] **Step 3: Update `backend/main.py`**

Replace the full file contents with:

```python
import asyncio

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from inference import run_inference
from recorder import record_scroll

app = FastAPI()


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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"file": file_path, "result": result}
```

- [ ] **Step 4: Run all tests — expect all pass**

```bash
cd backend && python -m pytest tests/ -v
```

Expected:
```
tests/test_inference.py::test_run_inference_returns_preds_and_segments PASSED
tests/test_inference.py::test_run_inference_cleans_up_mp4_on_success PASSED
tests/test_inference.py::test_run_inference_cleans_up_mp4_on_error PASSED
tests/test_inference.py::test_run_inference_ffmpeg_failure_raises PASSED
tests/test_pipeline.py::test_pipeline_returns_file_and_result PASSED
tests/test_pipeline.py::test_pipeline_returns_500_on_record_error PASSED
tests/test_pipeline.py::test_pipeline_returns_500_on_inference_error PASSED
7 passed
```

- [ ] **Step 5: Commit**

```bash
git add backend/main.py backend/tests/test_pipeline.py
git commit -m "feat: add POST /pipeline endpoint chaining record and TribeV2 inference"
```
