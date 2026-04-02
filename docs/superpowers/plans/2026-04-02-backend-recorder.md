# Backend Recorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a FastAPI backend with a single `POST /record` endpoint that uses Playwright to open a URL, scroll the page, save a `.webm` video, and return the file path.

**Architecture:** One FastAPI app (`main.py`) delegates to a single async function in `recorder.py` that drives a headless Chromium browser via Playwright. The browser's built-in video recording captures the session to a `recordings/` output directory.

**Tech Stack:** Python 3.11+, FastAPI, uvicorn, Playwright (async API), pytest, pytest-asyncio, httpx (for test client)

---

## File Map

| File | Responsibility |
|---|---|
| `backend/requirements.txt` | All dependencies pinned |
| `backend/.gitignore` | Ignore `recordings/` |
| `backend/recorder.py` | `record_scroll(url, output_dir) -> str` — all Playwright logic |
| `backend/main.py` | FastAPI app, `POST /record` route, error handling |
| `tests/__init__.py` | Empty, makes tests a package |
| `tests/test_recorder.py` | Unit tests for `record_scroll` with mocked Playwright |
| `tests/test_main.py` | Integration tests for the HTTP endpoint via TestClient |

---

## Task 1: Scaffold the project

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.gitignore`
- Create: `tests/__init__.py`

- [ ] **Step 1: Create `backend/requirements.txt`**

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
playwright==1.44.0
pydantic==2.7.1
pytest==8.2.0
pytest-asyncio==0.23.6
httpx==0.27.0
```

- [ ] **Step 1b: Create `backend/pytest.ini`**

Required so pytest-asyncio treats all `async def test_*` functions as async tests without per-test decorators.

```ini
[pytest]
asyncio_mode = auto
testpaths = ../tests
```

- [ ] **Step 2: Create `backend/.gitignore`**

```
recordings/
__pycache__/
*.pyc
.pytest_cache/
```

- [ ] **Step 3: Create empty `tests/__init__.py`**

```python

```

- [ ] **Step 4: Install dependencies and Playwright browser**

```bash
cd backend
pip install -r requirements.txt
playwright install chromium
```

Expected: no errors, `chromium` binary downloaded.

- [ ] **Step 5: Commit**

```bash
git add backend/requirements.txt backend/.gitignore tests/__init__.py
git commit -m "chore: scaffold backend project structure"
```

---

## Task 2: Implement `recorder.py` (TDD)

**Files:**
- Create: `tests/test_recorder.py`
- Create: `backend/recorder.py`

- [ ] **Step 1: Write failing tests for `record_scroll`**

Create `tests/test_recorder.py`:

```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import os


@pytest.mark.asyncio
async def test_record_scroll_returns_webm_path():
    """record_scroll returns a path ending in .webm inside the output dir."""
    with patch("recorder.async_playwright") as mock_pw:
        # Set up mock context manager chain
        mock_context = AsyncMock()
        mock_browser = AsyncMock()
        mock_page = AsyncMock()

        mock_pw.return_value.__aenter__ = AsyncMock(return_value=mock_context)
        mock_pw.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_context.chromium.launch = AsyncMock(return_value=mock_browser)
        mock_browser.new_context = AsyncMock(return_value=AsyncMock())
        mock_browser.new_context.return_value.__aenter__ = AsyncMock(
            return_value=mock_browser.new_context.return_value
        )
        mock_browser.new_context.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_browser.new_context.return_value.new_page = AsyncMock(
            return_value=mock_page
        )
        mock_page.goto = AsyncMock()
        mock_page.evaluate = AsyncMock(return_value=1000)
        mock_page.mouse.wheel = AsyncMock()

        # Mock the video path
        mock_video = MagicMock()
        mock_video.path = AsyncMock(return_value="/tmp/recordings/abc123.webm")
        mock_page.video = mock_video

        from recorder import record_scroll

        result = await record_scroll("https://example.com", output_dir="/tmp/recordings")

        assert result.endswith(".webm")
        assert "recordings" in result


@pytest.mark.asyncio
async def test_record_scroll_calls_goto_with_url():
    """record_scroll navigates to the given URL."""
    with patch("recorder.async_playwright") as mock_pw:
        mock_context = AsyncMock()
        mock_browser = AsyncMock()
        mock_page = AsyncMock()

        mock_pw.return_value.__aenter__ = AsyncMock(return_value=mock_context)
        mock_pw.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_context.chromium.launch = AsyncMock(return_value=mock_browser)
        mock_browser.new_context = AsyncMock(return_value=AsyncMock())
        mock_browser.new_context.return_value.__aenter__ = AsyncMock(
            return_value=mock_browser.new_context.return_value
        )
        mock_browser.new_context.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_browser.new_context.return_value.new_page = AsyncMock(
            return_value=mock_page
        )
        mock_page.goto = AsyncMock()
        mock_page.evaluate = AsyncMock(return_value=500)
        mock_page.mouse.wheel = AsyncMock()

        mock_video = MagicMock()
        mock_video.path = AsyncMock(return_value="/tmp/recordings/abc123.webm")
        mock_page.video = mock_video

        from recorder import record_scroll

        await record_scroll("https://example.com", output_dir="/tmp/recordings")

        mock_page.goto.assert_called_once_with(
            "https://example.com", wait_until="networkidle"
        )
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend
pytest ../tests/test_recorder.py -v
```

Expected: `ModuleNotFoundError: No module named 'recorder'`

- [ ] **Step 3: Implement `backend/recorder.py`**

```python
import asyncio
import os
import uuid
from playwright.async_api import async_playwright


async def record_scroll(url: str, output_dir: str = "recordings") -> str:
    """
    Opens url in a headless Chromium browser, scrolls to the bottom,
    records the session as a .webm video, and returns the saved file path.
    """
    os.makedirs(output_dir, exist_ok=True)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        async with await browser.new_context(
            record_video_dir=output_dir,
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720},
        ) as context:
            page = await context.new_page()
            await page.goto(url, wait_until="networkidle")

            # Get total scroll height
            scroll_height = await page.evaluate("document.body.scrollHeight")

            # Scroll in increments for a smooth recording
            step = 200
            for y in range(0, scroll_height, step):
                await page.mouse.wheel(0, step)
                await asyncio.sleep(0.05)

            # Pause briefly at the bottom
            await asyncio.sleep(0.5)

            video_path = await page.video.path()

    return video_path
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd backend
pytest ../tests/test_recorder.py -v
```

Expected:
```
PASSED tests/test_recorder.py::test_record_scroll_returns_webm_path
PASSED tests/test_recorder.py::test_record_scroll_calls_goto_with_url
```

- [ ] **Step 5: Commit**

```bash
git add backend/recorder.py tests/test_recorder.py
git commit -m "feat: add Playwright scroll recorder"
```

---

## Task 3: Implement `main.py` (TDD)

**Files:**
- Create: `tests/test_main.py`
- Create: `backend/main.py`

- [ ] **Step 1: Write failing tests for `POST /record`**

Create `tests/test_main.py`:

```python
import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport


@pytest.mark.asyncio
async def test_record_returns_file_path():
    """POST /record with a valid URL returns a file path."""
    with patch("main.record_scroll", new_callable=AsyncMock) as mock_record:
        mock_record.return_value = "recordings/abc123.webm"

        from main import app

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post("/record", json={"url": "https://example.com"})

        assert response.status_code == 200
        assert response.json() == {"file": "recordings/abc123.webm"}
        mock_record.assert_called_once_with("https://example.com")


@pytest.mark.asyncio
async def test_record_missing_url_returns_422():
    """POST /record with no body returns 422."""
    with patch("main.record_scroll", new_callable=AsyncMock):
        from main import app

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post("/record", json={})

        assert response.status_code == 422


@pytest.mark.asyncio
async def test_record_playwright_error_returns_500():
    """POST /record returns 500 when Playwright raises an exception."""
    with patch("main.record_scroll", new_callable=AsyncMock) as mock_record:
        mock_record.side_effect = Exception("browser crashed")

        from main import app

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post("/record", json={"url": "https://example.com"})

        assert response.status_code == 500
        assert "browser crashed" in response.json()["detail"]
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend
pytest ../tests/test_main.py -v
```

Expected: `ModuleNotFoundError: No module named 'main'`

- [ ] **Step 3: Implement `backend/main.py`**

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd backend
pytest ../tests/test_main.py -v
```

Expected:
```
PASSED tests/test_main.py::test_record_returns_file_path
PASSED tests/test_main.py::test_record_missing_url_returns_422
PASSED tests/test_main.py::test_record_playwright_error_returns_500
```

- [ ] **Step 5: Run the full test suite**

```bash
cd backend
pytest ../tests/ -v
```

Expected: all 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add backend/main.py tests/test_main.py
git commit -m "feat: add POST /record FastAPI endpoint"
```

---

## Task 4: Smoke test (manual)

**Files:** none — manual verification only

- [ ] **Step 1: Start the server**

```bash
cd backend
uvicorn main:app --reload
```

Expected: `Uvicorn running on http://127.0.0.1:8000`

- [ ] **Step 2: Hit the endpoint with curl**

```bash
curl -X POST http://127.0.0.1:8000/record \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

Expected (after a few seconds):
```json
{"file": "recordings/<some-uuid>.webm"}
```

- [ ] **Step 3: Verify the video file exists**

```bash
ls backend/recordings/
```

Expected: one `.webm` file present.

- [ ] **Step 4: Commit if any tweaks were needed**

```bash
git add -p
git commit -m "fix: smoke test corrections"
```
