def sanitize_log(data: str) -> str:
    """Sanitize user-controlled data for logging to prevent log injection attacks."""
    if data is None:
        return ""
    return str(data).replace("\n", "_").replace("\r", "_")
