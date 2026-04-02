# backend/tests/test_preview_manager.py
import sys
from unittest.mock import MagicMock, patch
import pytest

# Patch tribev2 so any indirect main.py imports don't fail
mock_tribe_module = MagicMock()
mock_tribe_module.TribeModel.from_pretrained.return_value = MagicMock()
sys.modules["tribev2"] = mock_tribe_module

import preview_manager  # noqa: E402


@pytest.fixture(autouse=True)
def reset_state():
    preview_manager._preview_procs = []
    preview_manager._repo_root = None
    yield
    preview_manager._preview_procs = []
    preview_manager._repo_root = None


def test_start_previews_returns_two_urls():
    with patch("preview_manager.subprocess.run"), \
         patch("preview_manager.subprocess.Popen") as mock_popen, \
         patch("preview_manager.os.symlink"), \
         patch("preview_manager.time.sleep"):
        mock_popen.return_value = MagicMock()
        urls = preview_manager.start_previews(["branch-v1", "branch-v2"])

    assert urls == ["http://localhost:6005", "http://localhost:6006"]


def test_start_previews_spawns_two_vite_processes():
    with patch("preview_manager.subprocess.run"), \
         patch("preview_manager.subprocess.Popen") as mock_popen, \
         patch("preview_manager.os.symlink"), \
         patch("preview_manager.time.sleep"):
        mock_popen.return_value = MagicMock()
        preview_manager.start_previews(["branch-v1", "branch-v2"])

    assert mock_popen.call_count == 2


def test_start_previews_uses_correct_ports():
    popen_cmds = []

    def capture(cmd, **kwargs):
        popen_cmds.append(cmd)
        return MagicMock()

    with patch("preview_manager.subprocess.run"), \
         patch("preview_manager.subprocess.Popen", side_effect=capture), \
         patch("preview_manager.os.symlink"), \
         patch("preview_manager.time.sleep"):
        preview_manager.start_previews(["branch-v1", "branch-v2"])

    ports = [cmd[cmd.index("--port") + 1] for cmd in popen_cmds]
    assert ports == ["6005", "6006"]


def test_start_previews_terminates_old_processes():
    old_proc = MagicMock()
    preview_manager._preview_procs = [old_proc]

    with patch("preview_manager.subprocess.run"), \
         patch("preview_manager.subprocess.Popen") as mock_popen, \
         patch("preview_manager.os.symlink"), \
         patch("preview_manager.time.sleep"):
        mock_popen.return_value = MagicMock()
        preview_manager.start_previews(["branch-v1", "branch-v2"])

    old_proc.terminate.assert_called_once()


def test_start_previews_creates_git_worktrees():
    with patch("preview_manager.subprocess.run") as mock_run, \
         patch("preview_manager.subprocess.Popen") as mock_popen, \
         patch("preview_manager.os.symlink"), \
         patch("preview_manager.time.sleep"):
        mock_popen.return_value = MagicMock()
        preview_manager.start_previews(["branch-v1", "branch-v2"])

    cmds = [c.args[0] for c in mock_run.call_args_list]
    worktree_adds = [c for c in cmds if "worktree" in c and "add" in c]
    assert len(worktree_adds) == 2
    assert any("branch-v1" in c for c in worktree_adds)
    assert any("branch-v2" in c for c in worktree_adds)


def test_start_previews_symlinks_node_modules():
    symlink_calls = []

    def capture_symlink(src, dst):
        symlink_calls.append((src, dst))

    with patch("preview_manager.subprocess.run"), \
         patch("preview_manager.subprocess.Popen") as mock_popen, \
         patch("preview_manager.os.symlink", side_effect=capture_symlink), \
         patch("preview_manager.time.sleep"):
        mock_popen.return_value = MagicMock()
        preview_manager.start_previews(["branch-v1", "branch-v2"])

    assert len(symlink_calls) == 2
    # Both point to the same original node_modules
    assert symlink_calls[0][0] == symlink_calls[1][0]
    # Different destinations (different worktrees)
    assert symlink_calls[0][1] != symlink_calls[1][1]
