# backend/preview_manager.py
import os
import subprocess
import time
from pathlib import Path

_preview_procs: list = []
_repo_root: str | None = None

_PORTS = [6005, 6006]
_WORKTREES = ["/tmp/preview-v1", "/tmp/preview-v2"]
_VITE_SUBPATH = "landing-page-demo/neurosplit-frontend"


def start_previews(branches: list[str]) -> list[str]:
    global _repo_root
    _repo_root = str(Path(__file__).parent.parent)

    _cleanup()

    original_nm = str(Path(_repo_root) / _VITE_SUBPATH / "node_modules")
    vite_bin = str(Path(_repo_root) / _VITE_SUBPATH / "node_modules" / ".bin" / "vite")

    for branch, worktree, port in zip(branches, _WORKTREES, _PORTS):
        subprocess.run(
            ["git", "-C", _repo_root, "worktree", "add", worktree, branch],
            check=True,
            capture_output=True,
        )

        nm_dst = Path(worktree) / _VITE_SUBPATH / "node_modules"
        if nm_dst.exists() or nm_dst.is_symlink():
            nm_dst.unlink()
        os.symlink(original_nm, str(nm_dst))

        proc = subprocess.Popen(
            [vite_bin, "--port", str(port), "--strictPort"],
            cwd=str(Path(worktree) / _VITE_SUBPATH),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        _preview_procs.append(proc)

    time.sleep(2.0)
    return [f"http://localhost:{port}" for port in _PORTS]


def _cleanup():
    global _preview_procs
    for proc in _preview_procs:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()
    _preview_procs = []

    if _repo_root:
        for worktree in _WORKTREES:
            subprocess.run(
                ["git", "-C", _repo_root, "worktree", "remove", "--force", worktree],
                capture_output=True,
            )
