import uuid
from datetime import datetime
from flask_restx import fields

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db, api

from app.api.utils.models_mixins import AuditMixin, Base


class IdirMembership(AuditMixin, Base):
    __tablename__ = 'idir_membership'
    idir_membership_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    idir_membership_name = db.Column(db.String)
    import_users_ind = db.Column(db.Boolean, server_default=FetchedValue())

    def __repr__(self):
        return '<IdirMembership %r>' % self.idir_membership_name

    @classmethod
    def find_by_membership_name(cls, membership_name):
        return cls.query.filter_by(idir_membership_name=membership_name).first()

    @classmethod
    def create(cls, idir_membership_name, import_users_ind, add_to_session=True):
        idir_membership = cls(
            idir_membership_name=idir_membership_name, import_users_ind=import_users_ind)
        if add_to_session:
            idir_membership.save(commit=False)
        return idir_membership

    @validates('idir_membership_name')
    def validate_status_code(self, key, idir_membership_name):
        if not idir_membership_name:
            raise AssertionError('IDIR membership name is not provided.')
        if len(idir_membership_name) > 254:
            raise AssertionError('IDIR membership name must not exceed 254 characters.')
        return idir_membership_name