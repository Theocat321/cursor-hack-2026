import asyncio
import os
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

            scroll_height = await page.evaluate("document.body.scrollHeight")

            step = 200
            for _ in range(0, scroll_height, step):
                await page.mouse.wheel(0, step)
                await asyncio.sleep(0.05)

            await asyncio.sleep(0.5)

            video_path = await page.video.path()

    return video_path
