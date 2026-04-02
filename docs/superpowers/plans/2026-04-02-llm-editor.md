# LLM Editor Pipeline Step — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GPT-4o-powered code-change step to `POST /pipeline` that reads `./landing-page-demo/src/` files, produces two design variants, writes each to disk, and commits each to its own git branch.

**Architecture:** New `backend/llm_editor.py` handles file reading, two GPT-4o calls (conservative + bold), file writing, and git branching. `main.py` gets a `POST /pipeline` endpoint chaining record → inference → LLM changes. The LLM client is lazily initialised so tests can import the module without an API key set.

**Tech Stack:** Python 3.11, FastAPI, OpenAI Python SDK (`gpt-4o`, `response_format: json_object`), subprocess for git, pytest + unittest.mock

---

### Task 1: Add openai to requirements.txt

**Files:**
- Modify: `backend/requirements.txt`

- [ ] **Step 1: Add the dependency**

Append `openai` to `backend/requirements.txt`. The file should end up as:

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
playwright==1.44.0
pydantic==2.7.1
pytest==8.2.0
pytest-asyncio==0.23.6
httpx==0.27.0
numpy
tribev2
openai
```

- [ ] **Step 2: Install it**

```bash
cd backend && pip install openai
```

Expected: Installs without error. `openai` appears in `pip list`.

- [ ] **Step 3: Commit**

```bash
git add backend/requirements.txt
git commit -m "chore: add openai dependency"
```

---

### Task 2: Write failing tests for llm_editor

**Files:**
- Create: `backend/tests/test_llm_editor.py`

- [ ] **Step 1: Create the test file**

```python
# backend/tests/test_llm_editor.py
import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest


def _make_fake_response(changes: dict) -> MagicMock:
    resp = MagicMock()
    resp.choices[0].message.content = json.dumps(changes)
    return resp


def _setup_landing_page(tmp_path: Path) -> None:
    src = tmp_path / "src"
    src.mkdir()
    (src / "App.tsx").write_text("<div>Hello</div>")
    (src / "index.css").write_text("body { margin: 0; }")


# We import llm_editor after patching so _client stays None at module load
import llm_editor  # noqa: E402


@pytest.fixture(autouse=True)
def reset_client():
    """Restore _client to None between tests."""
    original = llm_editor._client
    yield
    llm_editor._client = original


def test_returns_two_branches(tmp_path):
    _setup_landing_page(tmp_path)
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = _make_fake_response({"src/App.tsx": "<div>X</div>"})
    llm_editor._client = fake_client

    with patch("llm_editor.subprocess.run"):
        branches = llm_editor.apply_llm_changes({"preds": [0.1], "segments": []}, str(tmp_path))

    assert len(branches) == 2
    assert branches[0].endswith("-v1")
    assert branches[1].endswith("-v2")


def test_calls_gpt4o_twice(tmp_path):
    _setup_landing_page(tmp_path)
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = _make_fake_response({"src/App.tsx": "<div>X</div>"})
    llm_editor._client = fake_client

    with patch("llm_editor.subprocess.run"):
        llm_editor.apply_llm_changes({"preds": [], "segments": []}, str(tmp_path))

    assert fake_client.chat.completions.create.call_count == 2


def test_v1_and_v2_use_different_prompts(tmp_path):
    _setup_landing_page(tmp_path)
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = _make_fake_response({"src/App.tsx": "<div>X</div>"})
    llm_editor._client = fake_client

    with patch("llm_editor.subprocess.run"):
        llm_editor.apply_llm_changes({"preds": [], "segments": []}, str(tmp_path))

    calls = fake_client.chat.completions.create.call_args_list
    prompt_v1 = calls[0].kwargs["messages"][1]["content"]
    prompt_v2 = calls[1].kwargs["messages"][1]["content"]
    assert prompt_v1 != prompt_v2


def test_writes_files_to_disk(tmp_path):
    _setup_landing_page(tmp_path)
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = _make_fake_response(
        {"src/App.tsx": "<div>Updated</div>"}
    )
    llm_editor._client = fake_client

    with patch("llm_editor.subprocess.run"):
        llm_editor.apply_llm_changes({"preds": [], "segments": []}, str(tmp_path))

    assert (tmp_path / "src" / "App.tsx").read_text() == "<div>Updated</div>"


def test_raises_on_api_error(tmp_path):
    _setup_landing_page(tmp_path)
    fake_client = MagicMock()
    fake_client.chat.completions.create.side_effect = RuntimeError("API error")
    llm_editor._client = fake_client

    with patch("llm_editor.subprocess.run"):
        with pytest.raises(RuntimeError, match="API error"):
            llm_editor.apply_llm_changes({"preds": [], "segments": []}, str(tmp_path))


def test_raises_on_invalid_json(tmp_path):
    _setup_landing_page(tmp_path)
    bad_resp = MagicMock()
    bad_resp.choices[0].message.content = "not valid json {{{"
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = bad_resp
    llm_editor._client = fake_client

    with patch("llm_editor.subprocess.run"):
        with pytest.raises(json.JSONDecodeError):
            llm_editor.apply_llm_changes({"preds": [], "segments": []}, str(tmp_path))


def test_git_branches_from_main(tmp_path):
    _setup_landing_page(tmp_path)
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = _make_fake_response({"src/App.tsx": "<div>X</div>"})
    llm_editor._client = fake_client

    with patch("llm_editor.subprocess.run") as mock_run:
        llm_editor.apply_llm_changes({"preds": [], "segments": []}, str(tmp_path))

    git_calls = [c.args[0] for c in mock_run.call_args_list]
    # Should checkout main before each branch creation
    checkout_main_calls = [c for c in git_calls if "checkout" in c and "main" in c]
    # At least 3: before v1, before v2, and final restore
    assert len(checkout_main_calls) >= 3
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && python -m pytest tests/test_llm_editor.py -v
```

Expected: `ModuleNotFoundError: No module named 'llm_editor'` — confirms tests are wired correctly and need the implementation.

- [ ] **Step 3: Commit**

```bash
git add backend/tests/test_llm_editor.py
git commit -m "test: add failing tests for llm_editor"
```

---

### Task 3: Implement llm_editor.py

**Files:**
- Create: `backend/llm_editor.py`

- [ ] **Step 1: Write the implementation**

```python
# backend/llm_editor.py
import json
import subprocess
import time
from pathlib import Path

_client = None  # lazily initialised so module imports without OPENAI_API_KEY set

_SYSTEM_PROMPT = (
    "You are a frontend design engineer. You will receive React/Tailwind source files "
    "and a UI analysis result. Return ONLY a JSON object mapping relative file paths "
    "to their complete new contents. No explanation, no markdown, just the JSON."
)

_V1_TEMPLATE = (
    "Here are the source files:\n{files_json}\n\n"
    "Here is the UI analysis:\n{tribe_result}\n\n"
    "Make conservative, targeted improvements to the design — improve spacing, typography, "
    "color contrast, and visual hierarchy. Keep the overall structure intact."
)

_V2_TEMPLATE = (
    "Here are the source files:\n{files_json}\n\n"
    "Here is the UI analysis:\n{tribe_result}\n\n"
    "Make bold, creative redesign changes — rethink layout, visual style, and component "
    "structure to make this landing page significantly more compelling."
)


def _get_client():
    global _client
    if _client is None:
        from openai import OpenAI
        _client = OpenAI()
    return _client


def apply_llm_changes(tribe_result: dict, landing_page_path: str) -> list[str]:
    lp = Path(landing_page_path).resolve()
    git_root = str(lp.parent)
    src_dir = lp / "src"

    files = _read_source_files(lp, src_dir)
    files_json = json.dumps(files, indent=2)
    tribe_json = json.dumps(tribe_result, indent=2)

    ts = int(time.time())
    branches = []

    for version, template in [("v1", _V1_TEMPLATE), ("v2", _V2_TEMPLATE)]:
        branch = f"llm-changes-{ts}-{version}"
        subprocess.run(["git", "-C", git_root, "checkout", "main"], check=True, capture_output=True)
        subprocess.run(["git", "-C", git_root, "checkout", "-b", branch], check=True, capture_output=True)

        user_prompt = template.format(files_json=files_json, tribe_result=tribe_json)
        changes = _call_gpt4o(user_prompt)
        _write_files(lp, changes)

        subprocess.run(["git", "-C", git_root, "add", str(lp)], check=True, capture_output=True)
        subprocess.run(
            ["git", "-C", git_root, "commit", "-m", f"feat: llm design changes {version}"],
            check=True,
            capture_output=True,
        )
        branches.append(branch)

    subprocess.run(["git", "-C", git_root, "checkout", "main"], check=True, capture_output=True)
    return branches


def _read_source_files(lp: Path, src_dir: Path) -> dict[str, str]:
    files = {}
    for ext in ("*.tsx", "*.css", "*.html"):
        for path in src_dir.rglob(ext):
            rel = str(path.relative_to(lp))
            files[rel] = path.read_text()
    return files


def _call_gpt4o(user_prompt: str) -> dict[str, str]:
    response = _get_client().chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


def _write_files(lp: Path, changes: dict[str, str]) -> None:
    for rel_path, contents in changes.items():
        full = lp / rel_path
        full.parent.mkdir(parents=True, exist_ok=True)
        full.write_text(contents)
```

- [ ] **Step 2: Run tests**

```bash
cd backend && python -m pytest tests/test_llm_editor.py -v
```

Expected: All 7 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add backend/llm_editor.py
git commit -m "feat: add llm_editor with apply_llm_changes"
```

---

### Task 4: Update main.py with POST /pipeline

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Write the updated main.py**

```python
# backend/main.py
import asyncio
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from inference import run_inference
from llm_editor import apply_llm_changes
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"file": file_path, "result": result, "branches": branches}
```

- [ ] **Step 2: Verify existing /record test still passes**

```bash
cd backend && python -m pytest tests/test_record.py -v 2>/dev/null || python -m pytest tests/ -k "record" -v
```

Expected: Any existing record tests still PASS (inference and pipeline tests may not yet — that's fine, we fix them next).

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat: add POST /pipeline with record + inference + llm changes"
```

---

### Task 5: Update test_pipeline.py for branches

**Files:**
- Modify: `backend/tests/test_pipeline.py`

- [ ] **Step 1: Write the updated test file**

The existing tests need `apply_llm_changes` mocked (otherwise it runs for real). Add two new tests for the branches field and LLM error path.

```python
# backend/tests/test_pipeline.py
import sys
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import AsyncClient, ASGITransport

# Patch tribev2 before importing anything that touches inference
mock_tribe_module = MagicMock()
mock_tribe_module.TribeModel.from_pretrained.return_value = MagicMock()
sys.modules["tribev2"] = mock_tribe_module

from main import app  # noqa: E402


@pytest.mark.asyncio
async def test_pipeline_returns_file_and_result():
    fake_result = {"preds": [[0.1, 0.2], [0.3, 0.4]], "segments": [{"start": 0, "end": 1}]}
    fake_branches = ["llm-changes-100-v1", "llm-changes-100-v2"]

    with patch("main.record_scroll", new_callable=AsyncMock, return_value="recordings/test.webm"), \
         patch("main.run_inference", return_value=fake_result), \
         patch("main.apply_llm_changes", return_value=fake_branches):
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

    with patch("main.record_scroll", new_callable=AsyncMock, return_value="recordings/test.webm"), \
         patch("main.run_inference", return_value=fake_result), \
         patch("main.apply_llm_changes", return_value=fake_branches):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/pipeline", json={"url": "https://example.com"})

    assert response.status_code == 200
    assert response.json()["branches"] == fake_branches


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
```

- [ ] **Step 2: Run all pipeline tests**

```bash
cd backend && python -m pytest tests/test_pipeline.py -v
```

Expected: All 5 tests PASS.

- [ ] **Step 3: Run the full test suite**

```bash
cd backend && python -m pytest tests/ -v
```

Expected: All tests PASS (llm_editor + pipeline + inference).

- [ ] **Step 4: Commit**

```bash
git add backend/tests/test_pipeline.py
git commit -m "test: update pipeline tests to cover branches and llm error"
```
