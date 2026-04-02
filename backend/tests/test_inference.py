import sys
import os
import numpy as np
import pytest
from unittest.mock import MagicMock, patch, call

# Patch tribev2 at import time so inference.py can be imported without the real library
mock_tribe_module = MagicMock()
mock_model_instance = MagicMock()
mock_tribe_module.TribeModel.from_pretrained.return_value = mock_model_instance
sys.modules["tribev2"] = mock_tribe_module

import inference  # noqa: E402


def setup_function():
    mock_model_instance.reset_mock(side_effect=True, return_value=True)


def test_run_inference_returns_preds_and_segments(tmp_path):
    fake_webm = tmp_path / "recording.webm"
    fake_webm.write_bytes(b"fake video data")

    mock_df = MagicMock()
    mock_preds = np.zeros((10, 5))
    mock_seg = MagicMock()
    mock_seg.start = 0.0
    mock_seg.duration = 1.0
    mock_seg.timeline = "test"
    mock_segments = [mock_seg]

    mock_model_instance.get_events_dataframe.return_value = mock_df
    mock_model_instance.predict.return_value = (mock_preds, mock_segments)

    with patch("inference.subprocess.run") as mock_subprocess:
        mock_subprocess.return_value = MagicMock(returncode=0)
        result = inference.run_inference(str(fake_webm))

    assert result["preds"] == mock_preds.tolist()
    assert result["segments"] == [{"start": 0.0, "duration": 1.0, "timeline": "test"}]


def test_run_inference_cleans_up_mp4_on_success(tmp_path):
    fake_webm = tmp_path / "recording.webm"
    fake_webm.write_bytes(b"fake video data")

    mock_model_instance.get_events_dataframe.return_value = MagicMock()
    mock_model_instance.predict.return_value = (np.zeros((5, 3)), [])

    created_mp4 = []

    def fake_subprocess_run(cmd, **kwargs):
        # Simulate ffmpeg creating the output file
        mp4_path = cmd[-1]
        created_mp4.append(mp4_path)
        open(mp4_path, "wb").close()
        return MagicMock(returncode=0)

    with patch("inference.subprocess.run", side_effect=fake_subprocess_run):
        inference.run_inference(str(fake_webm))

    assert len(created_mp4) == 1
    assert not os.path.exists(created_mp4[0])  # cleaned up


def test_run_inference_cleans_up_mp4_on_error(tmp_path):
    fake_webm = tmp_path / "recording.webm"
    fake_webm.write_bytes(b"fake video data")

    created_mp4 = []

    def fake_subprocess_run(cmd, **kwargs):
        mp4_path = cmd[-1]
        created_mp4.append(mp4_path)
        open(mp4_path, "wb").close()
        return MagicMock(returncode=0)

    mock_model_instance.get_events_dataframe.side_effect = RuntimeError("model failed")

    with patch("inference.subprocess.run", side_effect=fake_subprocess_run):
        with pytest.raises(RuntimeError, match="model failed"):
            inference.run_inference(str(fake_webm))

    assert not os.path.exists(created_mp4[0])  # still cleaned up


def test_run_inference_ffmpeg_failure_raises(tmp_path):
    fake_webm = tmp_path / "recording.webm"
    fake_webm.write_bytes(b"fake video data")

    import subprocess
    with patch("inference.subprocess.run", side_effect=subprocess.CalledProcessError(1, "ffmpeg")):
        with pytest.raises(subprocess.CalledProcessError):
            inference.run_inference(str(fake_webm))
