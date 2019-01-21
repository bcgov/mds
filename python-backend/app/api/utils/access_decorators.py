from functools import wraps
from app.extensions import jwt

MINE_VIEW = "mds-mine-view"
MINE_CREATE = "mds-mine-create"
MINE_ADMIN = "mds-mine-admin"
MINESPACE_PROPONENT = "minespace-proponent"


def requires_role_mine_view(func):
    return _inner_wrapper(func, MINE_VIEW)


def requires_role_mine_create(func):
    return _inner_wrapper(func, MINE_CREATE)


def requires_role_mine_admin(func):
    return _inner_wrapper(func, MINE_ADMIN)


def requires_any_of(roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwds):
            return jwt.has_one_of_roles(roles)(func)(*args, **kwds)

        wrapper.required_roles = _combine_role_flags(func, roles)
        return wrapper
    return decorator


def _inner_wrapper(func, role):
    @wraps(func)
    def wrapper(*args, **kwds):
        return jwt.requires_roles([role])(func)(*args, **kwds)

    wrapper.required_roles = _combine_role_flags(func, [role])
    return wrapper


def _combine_role_flags(func, roles):
    flags = getattr(func, "required_roles", [])
    flags.extend(roles)
    return flags
