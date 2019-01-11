import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base
from ..models.minespace_user_mines import MinespaceUserMines


class MinespaceUser(Base):
    __tablename__ = 'minespace_users'

    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    keycloak_guid = db.Column(UUID(as_uuid=True))
    username = db.Column(db.String(60), nullable=False)
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    mines = db.relationship('MinespaceUserMines', backref='user', lazy='joined')

    def json(self, depth):
        result = {'keycloak_guid': str(self.keycloak_guid or ''), 'username': self.username}
        if depth:
            result['mines'] = [x.json(depth=depth - 1) for x in self.mines]
        return result

    @classmethod
    def find_by_guid(cls, user_guid):
        return cls.query.filter_by(keycloak_guid=user_guid).filter_by(deleted_ind=False).first()
