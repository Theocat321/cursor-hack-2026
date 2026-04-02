# backend/llm_editor.py
import json
import subprocess
import time
from pathlib import Path

import numpy as np

_client = None  # lazily initialised so module imports without OPENAI_API_KEY set

_PROMPTS_DIR = Path(__file__).parent / "prompts"

_SYSTEM_PROMPT = (
    "You are a frontend design engineer. You will receive React/Tailwind source files "
    "and a UI analysis result. Return ONLY a JSON object mapping relative file paths "
    "to their complete new contents. No explanation, no markdown, just the JSON."
)

_FILE_HEADER = (
    "Here are the source files:\n{files_json}\n\n"
    "Here is the UI analysis:\n{tribe_result}\n\n"
)


def _load_design_prompt(filename: str) -> str:
    return (_PROMPTS_DIR / filename).read_text()


def _get_client():
    global _client
    if _client is None:
        from openai import OpenAI
        _client = OpenAI()
    return _client


def _summarize_tribe_result(tribe_result: dict) -> dict:
    """Replace the raw preds array with compact summary stats."""
    preds = np.array(tribe_result["preds"], dtype=float)
    if preds.ndim == 1:
        preds = preds.reshape(1, -1)
    if preds.size == 0:
        return {"segments": tribe_result["segments"], "preds_summary": {"shape": list(preds.shape)}}
    return {
        "segments": tribe_result["segments"],
        "preds_summary": {
            "shape": list(preds.shape),
            "mean_activation": float(preds.mean()),
            "std_activation": float(preds.std()),
            "top_1pct_threshold": float(np.percentile(preds, 99)),
            "peak_timestep": int(preds.mean(axis=1).argmax()),
            "n_active_vertices": int((preds.mean(axis=0) > np.percentile(preds, 90)).sum()),
        },
    }


def apply_llm_changes(tribe_result: dict, landing_page_path: str) -> list[str]:
    lp = Path(landing_page_path).resolve()
    git_root = str(lp.parent)
    src_dir = lp / "src"

    files = _read_source_files(lp, src_dir)
    files_json = json.dumps(files, indent=2)
    tribe_json = json.dumps(_summarize_tribe_result(tribe_result), indent=2)

    ts = int(time.time())
    branches = []

    design_prompts = [_load_design_prompt("design_A.md"), _load_design_prompt("design_B.md")]
    for version, design_prompt in zip(["v1", "v2"], design_prompts):
        branch = f"llm-changes-{ts}-{version}"
        subprocess.run(["git", "-C", git_root, "checkout", "main"], check=True, capture_output=True)
        subprocess.run(["git", "-C", git_root, "checkout", "-b", branch], check=True, capture_output=True)

        user_prompt = _FILE_HEADER.format(files_json=files_json, tribe_result=tribe_json) + design_prompt
        changes = _call_gpt4o(user_prompt)
        _write_files(lp, changes)

        subprocess.run(["git", "-C", git_root, "add", str(lp)], check=True, capture_output=True)
        subprocess.run(
            ["git", "-C", git_root, "commit", "-m", f"feat: llm design changes {version}"],
            check=True,
            capture_output=True,
        )
        branches.append(branch)

    subprocess.run(["git", "-C", git_root, "checkout", "main"], check=True, capture_output=True)
    return branches


def _read_source_files(lp: Path, src_dir: Path) -> dict[str, str]:
    files = {}
    for ext in ("*.tsx", "*.css", "*.html"):
        for path in src_dir.rglob(ext):
            rel = str(path.relative_to(lp))
            files[rel] = path.read_text()
    return files


def _call_gpt4o(user_prompt: str) -> dict[str, str]:
    response = _get_client().chat.completions.create(
        model="gpt-5.4",
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


def _write_files(lp: Path, changes: dict[str, str]) -> None:
    for rel_path, contents in changes.items():
        full = lp / rel_path
        full.parent.mkdir(parents=True, exist_ok=True)
        full.write_text(contents)
