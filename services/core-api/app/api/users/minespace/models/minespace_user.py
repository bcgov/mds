import uuid, re

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, Base
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine


class MinespaceUser(SoftDeleteMixin, Base):
    __tablename__ = 'minespace_user'

    user_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    keycloak_guid = db.Column(UUID(as_uuid=True))
    email_or_username = db.Column(db.String(100), nullable=False)

    minespace_user_mines = db.relationship('MinespaceUserMine', backref='user', lazy='joined')

    @hybrid_property
    def mines(self):
        return [x.mine_guid for x in self.minespace_user_mines]

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
    def find_by_email(cls, email_or_username):
        return cls.query.filter_by(email_or_username=email_or_username).filter_by(
            deleted_ind=False).first()

    @classmethod
    def create_minespace_user(cls, email_or_username, add_to_session=True):
        minespace_user = cls(email_or_username=email_or_username)
        if add_to_session:
            minespace_user.save(commit=False)
        return minespace_user

    @validates('email_or_username')
    def validate_email(self, key, email_or_username):
        if not email_or_username:
            raise AssertionError('Identifier is not provided.')
        return email_or_username