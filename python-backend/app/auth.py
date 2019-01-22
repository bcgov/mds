import re

from cached_property import cached_property

from flask import g, request
import uuid
from uuid import UUID
from typing import Mapping, Optional, Set
from .api.utils.include.user_info import User
from .api.users.minespace.models.minespace_user import MinespaceUser


class Tenant(object):
    def __init__(self, access: Optional[Set[UUID]] = None):
        self.access = access or {}

    def __repr__(self):
        return "<{} mine_ids={}>".format(type(self).__name__, self.mine_ids)

    @cached_property
    def mine_ids(self):
        return self.access

    def get_permission(self, mine_id: UUID):
        return self.access.get(mine_id)

    @classmethod
    def from_user(cls, user: User):
        if not user:
            return cls()

        g.current_user = user
        return UserTenant(user_id=user.user_id)


class UserTenant(Tenant):
    def __init__(self, user_id: int):
        self.user_id = user_id

    def __repr__(self):
        return "<{} user_id={}>".format(type(self).__name__, str(self.user_id))

    @cached_property
    def access(self) -> Set[UUID]:
        if not self.user_id:
            return None

        return get_access()


def get_access():
    user = get_current_user()
    return list(x.mine_guid for x in user.mines)


def get_current_user():
    email = get_user_email()
    user = MinespaceUser.query.unconstrained_unsafe().filter_by(email=email).filter_by(
        deleted_ind=False).first()
    return user


def get_user_email():
    return User().get_user_email()


def get_tenant_from_user():
    user = get_current_user()
    return Tenant.from_user(user)


def get_current_tenant():
    rv = getattr(g, 'current_tenant', None)
    if rv == None:
        rv = get_tenant_from_user()
        g.current_tenant = rv
    return rv


def get_token():
    header = request.headers.get("Authorization", "").lower()
    if not header:
        return None

    if not header.startswith("bearer"):
        return None

    token = re.sub(r"^bearer(:|\s)\s*", "", header).strip()

    return token