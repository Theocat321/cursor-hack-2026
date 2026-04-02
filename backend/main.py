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
