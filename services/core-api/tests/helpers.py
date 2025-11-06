from datetime import datetime

def get_datetime_iso8601_string(date: datetime):
    return date.isoformat() + "+00:00"

def get_datetime_tz_naive_string(date: datetime):
    return date.strftime("%Y-%m-%d %H:%M")

def subscribe_minespace_user(db_session, mine, email='test-proponent@bceid'):
    """Create a MineSpace user and subscribe them to the given mine."""
    ms_user = MinespaceUserFactory(bceid_username=email)
    MinespaceSubscriptionFactory(mine=mine, minespace_user=ms_user)
    db_session.commit()
    auth.clear_cache()
    return ms_user