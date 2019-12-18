import uuid, re

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine


class MinespaceUser(Base):
    __tablename__ = 'minespace_user'

    user_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    keycloak_guid = db.Column(UUID(as_uuid=True))
    email = db.Column(db.String(100), nullable=False)
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

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
    def find_by_email(cls, email):
        return cls.query.filter_by(email=email).filter_by(deleted_ind=False).first()

    @classmethod
    def create_minespace_user(cls, email, add_to_session=True):
        minespace_user = cls(email=email)
        if add_to_session:
            minespace_user.save(commit=False)
        return minespace_user

    @validates('email')
    def validate_email(self, key, email):
        if not email:
            raise AssertionError('email is not provided.')
        if not re.match(r'[^@]+@[^@]+\.[^@]+', email):
            raise AssertionError('Invalid email format.')
        return email