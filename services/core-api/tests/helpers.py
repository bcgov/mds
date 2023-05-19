from datetime import datetime

def get_datetime_iso8601_string(date: datetime):
    return date.isoformat() + "+00:00"

def get_datetime_tz_naive_string(date: datetime):
    return date.strftime("%Y-%m-%d %H:%M")