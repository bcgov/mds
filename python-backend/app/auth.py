import re

from cached_property import cached_property

from flask import g, request
import uuid
from uuid import UUID
from typing import Mapping, Optional
from .api.utils.include.user_info import User


class Tenant(object):
    def __init__(self, access: Optional[Mapping[UUID, Optional[str]]] = None):
        self.access = access or {}

    def __repr__(self):
        return "<{} mine_ids={}>".format(type(self).__name__, self.mine_ids)

    @cached_property
    def mine_ids(self):
        return list(self.access.keys())

    def get_permission(self, repository_id: UUID):
        return self.access.get(repository_id)

    @classmethod
    def from_user(cls, user: User):
        if not user:
            return cls()

        g.current_user = user
        return UserTenant(user_id=user.id)


class UserTenant(Tenant):
    def __init__(self, user_id: str):
        self.user_id = user_id

    def __repr__(self):
        return "<{} user_id={}>".format(type(self).__name__, self.user_id)

    @cached_property
    def access(self) -> Mapping[UUID, str]:
        if not self.user_id:
            return None

        return {
            '2c6c8e31-e56f-4982-87e9-044cefc8b0b3': 'Access',
            '76963202-4ee6-4006-bd5b-8eac0fae110c': 'Access'
        }


"""         return dict(
            db.session.query(
                RepositoryAccess.repository_id, RepositoryAccess.permission
            ).filter(RepositoryAccess.user_id == self.user_id)
        ) """


def get_current_user():
    return User()


def get_user_email():
    return User().get_user_email()


def get_tenant_from_request():
    tenant = get_tenant_from_token()
    if tenant:
        return tenant

    user = get_current_user()
    return Tenant.from_user(user)


def get_current_tenant():
    rv = getattr(g, 'current_tenant', None)
    if rv == None:
        rv = get_tenant_from_request()
        g.current_tenant = rv
    return rv


def get_tenant_from_token():
    header = request.headers.get("Authorization", "").lower()
    if not header:
        return None

    if not header.startswith("bearer"):
        return None

    token = re.sub(r"^bearer(:|\s)\s*", "", header).strip()

    return token