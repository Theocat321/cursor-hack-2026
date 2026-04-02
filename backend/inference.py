import os
import subprocess
import tempfile

from tribev2 import TribeModel

model = TribeModel.from_pretrained(
    "facebook/tribev2",
    cache_folder="./cache",
    device="cpu",
    config_update={
        "data.text_feature.device": "cpu",
        "data.audio_feature.device": "cpu",
        "data.video_feature.image.device": "cpu",
    },
)


def run_inference(video_path: str) -> dict:
    mp4_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            mp4_path = tmp.name

        subprocess.run(
            ["ffmpeg", "-y", "-i", video_path, mp4_path],
            capture_output=True,
            check=True,
        )

        df = model.get_events_dataframe(video_path=mp4_path)
        preds, segments = model.predict(events=df)
        segments_serializable = [
            {"start": float(s.start), "duration": float(s.duration), "timeline": s.timeline}
            for s in segments
        ]
        return {"preds": preds.tolist(), "segments": segments_serializable}
    finally:
        if mp4_path and os.path.exists(mp4_path):
            os.remove(mp4_path)
