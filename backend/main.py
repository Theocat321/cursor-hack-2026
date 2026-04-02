# backend/main.py
import asyncio
import logging
import traceback
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from brain_image import generate_brain_images
from inference import run_inference
from llm_editor import apply_llm_changes
from preview_manager import start_previews
from recorder import record_scroll

import json
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()

LANDING_PAGE_PATH = str(Path(__file__).parent.parent / "landing-page-demo" / "neurosplit-frontend")
LAST_RESULT_PATH = Path(__file__).parent / "last_inference_result.json"


def _save_result(result: dict) -> None:
    LAST_RESULT_PATH.write_text(json.dumps(result))


def _load_result() -> dict:
    if not LAST_RESULT_PATH.exists():
        raise FileNotFoundError("No cached inference result found — run the full pipeline first.")
    return json.loads(LAST_RESULT_PATH.read_text())


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
        logger.info("Step 1/5: Recording %s", request.url)
        file_path = await record_scroll(request.url)
        logger.info("Step 1/5 done — saved to %s", file_path)

        logger.info("Step 2/5: Running TribeV2 inference")
        result = await asyncio.to_thread(run_inference, file_path)
        _save_result(result)
        logger.info("Step 2/5 done — preds shape: %s", len(result["preds"]))

        logger.info("Step 3/5: Generating brain activation images")
        brain_results = await asyncio.to_thread(
            generate_brain_images, np.array(result["preds"])
        )
        logger.info("Step 3/5 done — %d images generated", len(brain_results))

        logger.info("Step 4/5: Applying LLM design changes")
        branches = await asyncio.to_thread(apply_llm_changes, result, LANDING_PAGE_PATH)
        logger.info("Step 4/5 done — branches: %s", branches)

        logger.info("Step 5/5: Starting preview servers")
        preview_urls = await asyncio.to_thread(start_previews, branches)
        logger.info("Step 5/5 done — preview URLs: %s", preview_urls)

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    return {
        "file": file_path,
        "result": result,
        "branches": branches,
        "preview_urls": preview_urls,
        "brain_results": brain_results,
    }


@app.post("/pipeline/resume")
async def pipeline_resume():
    """Skip recording + TribeV2 — reuse the last saved inference result."""
    try:
        logger.info("Resume: loading last inference result")
        result = _load_result()
        logger.info("Resume: loaded — preds shape: %s", len(result["preds"]))

        logger.info("Step 3/5: Generating brain activation images")
        brain_results = await asyncio.to_thread(
            generate_brain_images, np.array(result["preds"])
        )
        logger.info("Step 3/5 done — %d images generated", len(brain_results))

        logger.info("Step 4/5: Applying LLM design changes")
        branches = await asyncio.to_thread(apply_llm_changes, result, LANDING_PAGE_PATH)
        logger.info("Step 4/5 done — branches: %s", branches)

        logger.info("Step 5/5: Starting preview servers")
        preview_urls = await asyncio.to_thread(start_previews, branches)
        logger.info("Step 5/5 done — preview URLs: %s", preview_urls)

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    return {
        "result": result,
        "branches": branches,
        "preview_urls": preview_urls,
        "brain_results": brain_results,
    }
