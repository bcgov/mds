import hashlib
import json
from pathlib import Path
from typing import Any, Dict, Optional, cast

from .models import CACHE_VERSION


def safe_as_dict(value: Any) -> Any:
    if hasattr(value, "as_dict"):
        return value.as_dict()
    if isinstance(value, list):
        return [safe_as_dict(item) for item in value]
    if hasattr(value, "__dict__"):
        return {
            key: safe_as_dict(item)
            for key, item in value.__dict__.items()
            if not key.startswith("_")
        }
    return value


def compute_file_sha256(file_path: Path) -> str:
    digest = hashlib.sha256()
    with open(file_path, "rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def compute_cache_key(step_name: str, payload: Dict[str, Any]) -> str:
    encoded_payload = json.dumps(
        {"step": step_name, "version": CACHE_VERSION, **payload},
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(encoded_payload.encode("utf-8")).hexdigest()


def cache_file_path(cache_dir: Path, step_name: str, cache_key: str) -> Path:
    return cache_dir / step_name / f"{cache_key}.json"


def load_cache_entry(
    cache_dir: Path, step_name: str, cache_key: str
) -> Optional[Dict[str, Any]]:
    cache_path = cache_file_path(cache_dir, step_name, cache_key)
    if not cache_path.exists():
        return None

    with open(cache_path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)

    return cast(Dict[str, Any], payload)


def write_cache_entry(
    cache_dir: Path,
    step_name: str,
    cache_key: str,
    payload: Dict[str, Any],
) -> Path:
    step_dir = cache_dir / step_name
    step_dir.mkdir(parents=True, exist_ok=True)
    cache_path = step_dir / f"{cache_key}.json"

    with open(cache_path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)

    return cache_path
