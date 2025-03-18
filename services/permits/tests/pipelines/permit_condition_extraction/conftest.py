import pytest


@pytest.fixture(autouse=True)
def setup_debug_directory(tmp_path):
    """Create debug directory for tests that write debug files"""
    debug_dir = tmp_path / "debug"
    debug_dir.mkdir()
    return debug_dir
