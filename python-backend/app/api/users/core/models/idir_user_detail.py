import uuid
from datetime import datetime
from flask_restplus import fields

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db, api

from ....utils.models_mixins import AuditMixin, Base


class IdirUserDetail(AuditMixin, Base):
    __tablename__ = 'idir_user_detail'
    idir_user_detail_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    core_user_id = db.Column(db.Integer, db.ForeignKey('core_user.core_user_id'), nullable=False)
    bcgov_guid = db.Column(UUID(as_uuid=True), nullable=False)
    username = db.Column(db.String(128))
    title = db.Column(db.String(254))
    city = db.Column(db.String(128))
    department = db.Column(db.String(254))

    def __repr__(self):
        return '<IdirUserDetail %r>' % self.bcgov_guid

    @classmethod
    def create(cls, core_user_id, bcgov_guid, username, title, city, department, save=True):
        idir_user_detail = cls(
            core_user_id=core_user_id,
            bcgov_guid=bcgov_guid,
            username=username,
            title=title,
            city=city,
            department=department)
        if save:
            idir_user_detail.save(commit=False)
        return idir_user_detail

    @classmethod
    def find_by_idir_username(cls, idir_username):
        try:
            return cls.query.filter_by(username=idir_username).first()
        except ValueError:
            return None

    @validates('bcgov_guid')
    def validate_status_code(self, key, bcgov_guid):
        if not bcgov_guid:
            raise AssertionError('BCGOV guid is not provided.')
        return bcgov_guid

    @validates('username')
    def validate_application_no(self, key, username):
        if len(username) > 128:
            raise AssertionError('Username must not exceed 128 characters.')
        return username

    @validates('title')
    def validate_application_no(self, key, title):
        if len(title) > 254:
            raise AssertionError('Title must not exceed 254 characters.')
        return title

    @validates('city')
    def validate_application_no(self, key, city):
        if len(city) > 128:
            raise AssertionError('City must not exceed 128 characters.')
        return city

    @validates('department')
    def validate_application_no(self, key, department):
        if len(department) > 254:
            raise AssertionError('Department must not exceed 254 characters.')
        return department
