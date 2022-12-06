from cached_property import cached_property
from flask import g
from uuid import UUID
from sqlalchemy import or_
from typing import Optional, Set
from app.extensions import db
from .api.utils.include.user_info import User
from .api.users.minespace.models.minespace_user import MinespaceUser
from app.api.utils.access_decorators import MINESPACE_PROPONENT, MINE_ADMIN

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
    user = get_current_user()
    return list(x.mine_guid for x in user.minespace_user_mines)


def get_current_user():
    rv = getattr(g, 'current_user', None)
    if rv == None:
        email = get_user_email()
        username = get_user_username()
        rv = MinespaceUser.query.unbound_unsafe().filter(
            MinespaceUser.email_or_username.in_([email,
                                                 username])).filter_by(deleted_ind=False).first()
        g.current_user = rv
    return rv


def get_user_is_proponent():
    # The flask-jwt-oidc library throws an exception if a token does not exist.
    token_data = User().get_user_raw_info()
    try:
        is_proponent = MINESPACE_PROPONENT in token_data["client_roles"]
    except:
        raise Exception("A JWT token exists, but no roles are defined.")
    return is_proponent


def get_user_is_admin():
    token_data = User().get_user_raw_info()
    try:
        is_admin = MINE_ADMIN in token_data["client_roles"]
    except:
        raise Exception("A JWT token exists, but no roles are defined.")
    return is_admin


def get_user_email():
    return User().get_user_email()


def get_user_username():
    return User().get_user_username()


def get_current_user_security():
    rv = getattr(g, 'current_user_security', None)
    if rv is None:
        user = get_current_user()
        rv = UserSecurity(user_id=user.user_id if user else None)
        g.current_user_security = rv
    return rv


# For unit tests only
def clear_cache():
    g.current_user_security = None
    g.current_user = None
