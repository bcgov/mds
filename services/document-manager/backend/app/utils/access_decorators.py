from functools import wraps
from app.extensions import getJwtManager
from app.flask_jwt_oidc_local import AuthError
from werkzeug.exceptions import Forbidden

VIEW_ALL = "core_view_all"
MINE_EDIT = "core_edit_mines"
MINE_ADMIN = "core_admin"
EDIT_PARTY = "core_edit_parties"
EDIT_PERMIT = "core_edit_permits"
CLOSE_PERMIT = "core_close_permits"
EDIT_DO = "core_edit_do"
GIS = "core_gis"
EDIT_VARIANCE = "core_edit_variances"
MINESPACE_PROPONENT = "mds_minespace_proponents"

DOCUMENT_UPLOAD_ROLES = [
    MINE_ADMIN, MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE, MINESPACE_PROPONENT
]


def requires_role_view_all(func):
    return _inner_wrapper(func, VIEW_ALL)


def requires_role_mine_edit(func):
    return _inner_wrapper(func, MINE_EDIT)


def requires_role_mine_admin(func):
    return _inner_wrapper(func, MINE_ADMIN)


def requires_role_edit_party(func):
    return _inner_wrapper(func, EDIT_PARTY)


def requires_role_edit_permit(func):
    return _inner_wrapper(func, EDIT_PERMIT)


def requires_role_edit_do(func):
    return _inner_wrapper(func, EDIT_DO)


def requires_role_close_permit(func):
    return _inner_wrapper(func, CLOSE_PERMIT)


def requires_any_of(roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwds):
            try:
                return getJwtManager().has_one_of_roles(roles)(func)(*args, **kwds)
            except AuthError as e:
                print("required: ", roles)
                print("found: ", getJwtManager().get_all_roles())
                raise Forbidden(e.error['description'])

        wrapper.required_roles = _combine_role_flags(func, roles)
        return wrapper

    return decorator


def _inner_wrapper(func, role):
    @wraps(func)
    def wrapper(*args, **kwds):
            try:
                return getJwtManager().requires_roles([role])(func)(*args, **kwds)
            except AuthError as e:
                print("required: ", role)
                print("found: ", getJwtManager().get_all_roles())
                raise Forbidden(e.error['description'])

    wrapper.required_roles = _combine_role_flags(func, [role])
    return wrapper


def _combine_role_flags(func, roles):
    flags = getattr(func, "required_roles", [])
    flags.extend(roles)
    return flags
