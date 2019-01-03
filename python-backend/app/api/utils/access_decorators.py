from functools import wraps
from app.extensions import jwt

def requires_role_view(func):
    @wraps(func)
    def wrapper(*args, **kwds):
        return jwt.requires_roles(["mds-mine-view"])(func)(*args, **kwds) 
    return wrapper

def requires_role_create(func):
    @wraps(func)
    def wrapper(*args, **kwds):
        return jwt.requires_roles(["mds-mine-create"])(func)(*args, **kwds) 
    return wrapper