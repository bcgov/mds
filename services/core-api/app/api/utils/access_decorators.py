from functools import wraps

from app.extensions import getJwtManager
from app.flask_jwt_oidc_local.exceptions import AuthError
from werkzeug.exceptions import Forbidden

VIEW_ALL = "core_view_all"
MINE_EDIT = "core_edit_mines"
MINE_ADMIN = "core_admin"
EDIT_PARTY = "core_edit_parties"
EDIT_PERMIT = "core_edit_permits"
EDIT_EXPLOSIVES_PERMIT = "core_edit_explosives_permits"
EDIT_STANDARD_PERMIT_CONDITIONS = "core_edit_template_conditions"
EDIT_REPORT = "core_edit_reports"
CLOSE_PERMIT = "core_close_permits"
EDIT_DO = "core_edit_do"
EDIT_VARIANCE = "core_edit_variances"
EDIT_SECURITIES = "core_edit_securities"
MINESPACE_PROPONENT = "mds_minespace_proponents"
MDS_ADMINISTRATIVE_USERS = "mds_administrative_users"
EDIT_SUBMISSIONS = "core_edit_submissions"
EDIT_HISTORICAL_PERMIT_AMENDMENTS = "core_edit_historical_amendments"
GIS = "core_gis"
EDIT_NOW_DATES = "core_edit_now_dates"
EDIT_EMLI_CONTACTS = "core_edit_emli_contacts"
EDIT_PROJECT_SUMMARIES = "core_edit_project_summaries"
EDIT_REQUIREMENTS = "core_edit_requirements"
EDIT_INFORMATION_REQUIREMENTS_TABLE = "core_edit_information_requirements_table"
EDIT_MAJOR_MINE_APPLICATIONS = "core_edit_major_mine_applications"
EDIT_INCIDENTS = "core_edit_incidents"
EDIT_TSF = "core_edit_tsf"
EDIT_PROJECT_DECISION_PACKAGES = "core_edit_project_decision_packages"

def require_auth():
    return getJwtManager()._require_auth_validation()

def is_minespace_user():
    return getJwtManager().validate_roles([MINESPACE_PROPONENT])


def can_edit_now_dates():
    return getJwtManager().validate_roles([EDIT_NOW_DATES])


def can_edit_mines():
    return getJwtManager().validate_roles([MINE_EDIT])


def bceid_username():
    return getJwtManager().get_bceid_user_name()


def requires_role_edit_emli_contacts(func):
    return _inner_wrapper(func, EDIT_EMLI_CONTACTS)


def requires_role_edit_project_summaries(func):
    return _inner_wrapper(func, EDIT_PROJECT_SUMMARIES)


def requires_role_edit_incidents(func):
    return _inner_wrapper(func, EDIT_INCIDENTS)


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


def requires_role_edit_explosives_permit(func):
    return _inner_wrapper(func, EDIT_EXPLOSIVES_PERMIT)


def requires_role_edit_standard_permit_conditions(func):
    return _inner_wrapper(func, EDIT_STANDARD_PERMIT_CONDITIONS)


def requires_role_edit_report(func):
    return _inner_wrapper(func, EDIT_REPORT)


def requires_role_edit_do(func):
    return _inner_wrapper(func, EDIT_DO)


def requires_role_close_permit(func):
    return _inner_wrapper(func, CLOSE_PERMIT)


def requires_role_edit_submissions(func):
    return _inner_wrapper(func, EDIT_SUBMISSIONS)


def requires_role_edit_securities(func):
    return _inner_wrapper(func, EDIT_SECURITIES)


def requires_role_mds_administrative_users(func):
    return _inner_wrapper(func, MDS_ADMINISTRATIVE_USERS)


def requires_role_edit_now_dates(func):
    return _inner_wrapper(func, EDIT_NOW_DATES)


def requires_role_edit_tsf(func):
    return _inner_wrapper(func, EDIT_TSF)


def requires_role_edit_requirements(func):
    return _inner_wrapper(func, EDIT_REQUIREMENTS)


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
