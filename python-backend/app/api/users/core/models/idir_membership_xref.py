import uuid
from datetime import datetime
from flask_restplus import fields

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db, api

from ....utils.models_mixins import AuditMixin, Base


class IdirMembershipXref(AuditMixin, Base):
    __tablename__ = 'idir_membership_xref'
    core_user_id = db.Column(db.Integer, db.ForeignKey('core_user.core_user_id'), primary_key=True)
    idir_membership_id = db.Column(
        db.Integer, db.ForeignKey('idir_membership.idir_membership_id'), primary_key=True)

    def __repr__(self):
        return '<IdirMembershipXref %r %r>' % (self.core_user_id, self.idir_membership_id)

    @classmethod
    def create(cls, core_user_id, idir_membership_id, save=True):
        idir_membership_xref = cls(core_user_id=core_user_id, idir_membership_id=idir_membership_id)
        if save:
            idir_membership_xref.save(commit=False)
        return idir_membership_xref

    @validates('core_user_id')
    def validate_status_code(self, key, core_user_id):
        if not core_user_id:
            raise AssertionError('Core user id is not provided.')
        return core_user_id

    @validates('idir_membership_id')
    def validate_status_code(self, key, idir_membership_id):
        if not idir_membership_id:
            raise AssertionError('IDIR membership id is not provided.')
        return idir_membership_id