import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base
from ..models.minespace_user_mine import MinespaceUserMine


class MinespaceUser(Base):
    __tablename__ = 'minespace_user'

    user_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    keycloak_guid = db.Column(UUID(as_uuid=True))
    email = db.Column(db.String(100), nullable=False)
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    mines = db.relationship('MinespaceUserMine', backref='user', lazy='joined')

    def json(self):
        return {
            'user_id': str(self.user_id),
            'keycloak_guid': str(self.keycloak_guid or ''),
            'email': self.email,
            'mines': [str(x.mine_guid) for x in self.mines]
        }

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(deleted_ind=False).all()

    @classmethod
    def find_by_id(cls, id):
        return cls.query.filter_by(user_id=id).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_guid(cls, user_guid):
        return cls.query.filter_by(keycloak_guid=user_guid).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_email(cls, email):
        return cls.query.filter_by(email=email).filter_by(deleted_ind=False).first()

    @classmethod
    def create_minespace_user(cls, email, save=True):
        minespace_user = cls(email=email)
        if save:
            minespace_user.save(commit=False)
        return minespace_user