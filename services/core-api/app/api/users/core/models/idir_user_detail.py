import uuid
from datetime import datetime
from flask_restx import fields

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db, api

from app.api.utils.models_mixins import AuditMixin, Base


class IdirUserDetail(AuditMixin, Base):
    __tablename__ = 'idir_user_detail'
    idir_user_detail_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    core_user_id = db.Column(db.Integer, db.ForeignKey('core_user.core_user_id'), nullable=False)
    bcgov_guid = db.Column(UUID(as_uuid=True), nullable=False)
    username = db.Column(db.String)
    title = db.Column(db.String)
    city = db.Column(db.String)
    department = db.Column(db.String)

    def __repr__(self):
        return '<IdirUserDetail %r>' % self.bcgov_guid

    @classmethod
    def find_by_bcgov_guid(cls, bcgov_guid):
        try:
            uuid.UUID(bcgov_guid, version=4)
            return cls.query.filter_by(bcgov_guid=bcgov_guid).first()
        except ValueError:
            return None

    @classmethod
    def create(cls, core_user, bcgov_guid, username, title, city, department, add_to_session=True):
        idir_user_detail = cls(
            bcgov_guid=bcgov_guid, username=username, title=title, city=city, department=department)
        core_user.idir_user_detail = idir_user_detail
        if add_to_session:
            idir_user_detail.save(commit=False)
        return idir_user_detail

    @classmethod
    def find_by_idir_username(cls, idir_username):
        try:
            return cls.query.filter_by(username=idir_username).first()
        except ValueError:
            return None

    @validates('bcgov_guid')
    def validate_bcgov_guid(self, key, bcgov_guid):
        if not bcgov_guid:
            raise AssertionError('BCGOV guid is not provided.')
        return bcgov_guid

    @validates('username')
    def validate_username(self, key, username):
        if len(username) > 128:
            raise AssertionError('Username must not exceed 128 characters.')
        return username

    @validates('title')
    def validate_title(self, key, title):
        if len(title) > 254:
            raise AssertionError('Title must not exceed 254 characters.')
        return title

    @validates('city')
    def validate_city(self, key, city):
        if len(city) > 128:
            raise AssertionError('City must not exceed 128 characters.')
        return city

    @validates('department')
    def validate_department(self, key, department):
        if len(department) > 254:
            raise AssertionError('Department must not exceed 254 characters.')
        return department
