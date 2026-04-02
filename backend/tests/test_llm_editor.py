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
