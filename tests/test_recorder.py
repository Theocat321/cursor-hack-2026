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
