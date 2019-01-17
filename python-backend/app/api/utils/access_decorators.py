from functools import wraps
from app.extensions import jwt

MINE_VIEW = "mds-mine-view"
MINE_CREATE = "mds-mine-create"
MINE_ADMIN = "mds-mine-admin"

def requires_role_mine_view(func):
    return _inner_wrapper(func, MINE_VIEW)

def requires_role_mine_create(func):
     return _inner_wrapper(func, MINE_CREATE)

def requires_role_mine_admin(func):
     return _inner_wrapper(func, MINE_ADMIN)

def _inner_wrapper(func, role):
    @wraps(func)
    def wrapper(*args, **kwds):
        return jwt.requires_roles([role])(func)(*args, **kwds)

    wrapper.required_roles = getattr(func, "required_roles", [])
    wrapper.required_roles.append(role)

    return wrapper
