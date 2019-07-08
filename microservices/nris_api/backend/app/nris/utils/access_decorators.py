from functools import wraps
from app.extensions import jwt

NRIS_VIEW = "nris_view_all"


def requires_role_nris_view(func):
    return _inner_wrapper(func, NRIS_VIEW)


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
