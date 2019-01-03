from functools import wraps
from app.extensions import jwt

def requires_role_view(func):
    return role_decorator(func, "mds-mine-view")

def requires_role_create(func):
     return role_decorator(func, "mds-mine-create")

def role_decorator(func, role):
    @wraps(func)
    def wrapper(*args, **kwds):
        return jwt.requires_roles([role])(func)(*args, **kwds)

    wrapper.required_roles = [role]
    if func.required_roles:
        wrapper.required_roles.extend(func.required_roles)

    return wrapper