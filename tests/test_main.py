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
