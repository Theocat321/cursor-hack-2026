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
