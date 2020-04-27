from cached_property import cached_property
from flask import g
from uuid import UUID
from typing import Optional, Set
from app.api.utils.include.user_info import User
from app.api.users.core.models.core_user import CoreUser
from app.api.users.core.models.idir_user_detail import IdirUserDetail
from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.utils.access_decorators import MINESPACE_PROPONENT
from app.api.utils.access_decorators import VIEW_ALL
from flask import current_app

# This is for use when the database models are being used outside of the context of a flask application.
# Eg. Unit tests, create data.
global apply_security
apply_security = True

class UserSecurity(object):
    def __init__(self, user_id: Optional[int] = None, access: Optional[Set[UUID]] = None):
        self.access = access or {}
        self.user_id = user_id

    def __repr__(self):
        return "<{} mine_ids={}>".format(type(self).__name__, self.mine_ids)

    def is_restricted(self):
        return get_user_is_proponent()

    @cached_property
    def mine_ids(self) -> Set[UUID]:
        if not self.user_id:
            return []
        return get_mine_access()

    def get_permission(self, mine_id: UUID):
        return self.access.get(mine_id)


def get_mine_access():
    user = get_current_minespace_user()
    return list(x.mine_guid for x in user.minespace_user_mines)

def get_core_user():
    rv = getattr(g, 'current_user', None)
    if rv == None:
        email = get_user_email()
        rv = CoreUser.query.unbound_unsafe().filter_by(email=email).filter_by(
            active_ind=True).first()
        if rv is None:
            if is_core_user():
                new_cu = CoreUser.create(email=User().get_user_email(),
                                        phone_no=None,
                                        add_to_session=False)
                new_iud = IdirUserDetail.create(new_cu,
                                                bcgov_guid=None,
                                                username=User().get_user_username(),
                                                title=None,
                                                city=None,
                                                department=None,
                                                add_to_session=False)
                new_cu.save()
                rv = new_cu
        g.current_user = rv
    return rv

def get_current_minespace_user():
    rv = getattr(g, 'current_user', None)
    if rv == None:
        email = get_user_email()
        rv = MinespaceUser.query.unbound_unsafe().filter_by(email=email).filter_by(
            deleted_ind=False).first()
        g.current_user = rv
    return rv


def get_user_is_proponent():
    # The flask-jwt-oidc library throws an exception if a token does not exist.
    token_data = User().get_user_raw_info()
    try:
        is_proponent = MINESPACE_PROPONENT in token_data["realm_access"]["roles"]
    except:
        raise Exception("A JWT token exists, but no roles are defined.")
    return is_proponent

def is_core_user():
    # The flask-jwt-oidc library throws an exception if a token does not exist.
    token_data = User().get_user_raw_info()
    try:
        is_core_user = VIEW_ALL in token_data["realm_access"]["roles"]
    except:
        return
    return is_core_user

def get_user_email():
    return User().get_user_email()


def get_current_minespace_user_security():
    rv = getattr(g, 'current_user_security', None)
    if rv is None:
        user = get_current_minespace_user()
        rv = UserSecurity(user_id=user.user_id if user else None)
        g.current_user_security = rv
    return rv


# For unit tests only
def clear_cache():
    g.current_user_security = None
    g.current_user = None
