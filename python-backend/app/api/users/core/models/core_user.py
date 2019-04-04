import uuid
from datetime import datetime
from flask_restplus import fields

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db, api

from .idir_user_detail import IdirUserDetail
from .idir_membership import IdirMembership
from .idir_membership_xref import IdirMembershipXref

from ....utils.models_mixins import AuditMixin, Base


class CoreUser(AuditMixin, Base):
    __tablename__ = 'core_user'
    core_user_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    core_user_guid = db.Column(UUID(as_uuid=True), nullable=False, server_default=FetchedValue())
    email = db.Column(db.String(254))
    phone_no = db.Column(db.String(12))
    phone_ext = db.Column(db.String(4))
    idir_user_detail = db.relationship('IdirUserDetail', lazy='joined', backref="core_user")
    idir_membership = db.relationship(
        'IdirMembership', secondary='idir_membership_xref', lazy='select', backref="core_user")
    last_logon = db.Column(db.DateTime)
    active_ind = db.Column(db.Boolean, server_default=FetchedValue())

    def __repr__(self):
        return '<CoreUser %r>' % self.core_user_guid

    @classmethod
    def find_by_core_user_guid(cls, core_user_guid):
        try:
            uuid.UUID(core_user_guid, version=4)
            return cls.query.filter_by(core_user_guid=core_user_guid).first()
        except ValueError:
            return None

    @classmethod
    def find_by_idir_username(cls, idir_username):
        try:
            idir_user_detail = IdirUserDetail.find_by_idir_username(idir_username)

            if not idir_user_detail:
                return None

            return cls.query.filter_by(core_user_id=idir_user_detail.core_user_id).first()
        except ValueError:
            return None

    @classmethod
    def create(cls, core_user_guid, email, phone_no, phone_ext, save=True):
        core_user = cls(
            core_user_guid=core_user_guid, email=email, phone_no=phone_no, phone_ext=phone_ext)
        if save:
            core_user.save(commit=False)
        return core_user

    @validates('email')
    def validate_application_no(self, key, email):
        if len(email) > 254:
            raise AssertionError('Email must not exceed 254 characters.')
        return email

    @validates('phone_no')
    def validate_application_no(self, key, phone_no):
        if len(phone_no) > 12:
            raise AssertionError('Phone number must not exceed 12 characters.')
        return phone_no

    @validates('phone_ext')
    def validate_application_no(self, key, phone_ext):
        if len(phone_ext) > 4:
            raise AssertionError('Phone extension must not exceed 4 characters.')
        return phone_ext