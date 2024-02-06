import uuid
from datetime import datetime
from flask_restx import fields

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates, backref
from sqlalchemy.schema import FetchedValue
from app.extensions import db, api

from .idir_user_detail import IdirUserDetail
from .idir_membership import IdirMembership
from .idir_membership_xref import IdirMembershipXref

from app.api.utils.models_mixins import AuditMixin, Base


class CoreUser(AuditMixin, Base):
    __tablename__ = 'core_user'
    core_user_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    core_user_guid = db.Column(UUID(as_uuid=True), nullable=False, server_default=FetchedValue())
    email = db.Column(db.String)
    phone_no = db.Column(db.String)
    idir_user_detail = db.relationship(
        'IdirUserDetail', lazy='joined', backref=backref("core_user", uselist=False), uselist=False)
    idir_membership = db.relationship(
        'IdirMembership', secondary='idir_membership_xref', lazy='select', backref="core_users")
    last_logon = db.Column(db.DateTime)
    active_ind = db.Column(db.Boolean, server_default=FetchedValue())

    def __repr__(self):
        return '<CoreUser %r>' % self.core_user_guid

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(active_ind=True).all()

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
            return idir_user_detail.core_user
        except ValueError:
            return None

    @classmethod
    def create(cls, email, phone_no, add_to_session=True):
        core_user = cls(email=email, phone_no=phone_no)
        if add_to_session:
            core_user.save(commit=False)
        return core_user

    @validates('email')
    def validate_application_no(self, key, email):
        if len(email) > 254:
            raise AssertionError('Email must not exceed 254 characters.')
        return email

    @validates('phone_no')
    def validate_application_no(self, key, phone_no):
        if phone_no:
            if len(phone_no) > 64:
                raise AssertionError('Phone number must not exceed 12 characters.')
        return phone_no
