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
