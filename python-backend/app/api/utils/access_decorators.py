from functools import wraps
from app.extensions import jwt

MINE_VIEW = "core_view_all"
MINE_CREATE = "core_edit_mine"
MINE_ADMIN = "core_admin"
EDIT_PARTY = "core_edit_party"
EDIT_PERMIT = "core_edit_permit"
EDIT_DO = "core_edit_do"
EDIT_VARIANCE = "core_edit_variance"
MINESPACE_PROPONENT = "mds_minespace_proponents"


def requires_role_mine_view(func):
    return _inner_wrapper(func, MINE_VIEW)


def requires_role_mine_create(func):
    return _inner_wrapper(func, MINE_CREATE)


def requires_role_mine_admin(func):
    return _inner_wrapper(func, MINE_ADMIN)


def requires_role_edit_party(func):
    return _inner_wrapper(func, MINE_VIEW)


def requires_role_edit_permit(func):
    return _inner_wrapper(func, EDIT_PERMIT)


def requires_role_edit_do(func):
    return _inner_wrapper(func, EDIT_DO)


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
