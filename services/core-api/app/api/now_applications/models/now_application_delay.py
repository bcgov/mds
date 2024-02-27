import uuid
from datetime import datetime
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from marshmallow import fields, validate

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db

from app.api.now_submissions.models.application import Application
from app.api.mms_now_submissions.models.application import MMSApplication
from app.api.constants import *


class NOWApplicationDelay(Base, AuditMixin):
    __tablename__ = "now_application_delay"
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]
    _edit_key = NOW_APPLICATION_EDIT_GROUP

    class _ModelSchema(Base._ModelSchema):
        now_application_delay_id = fields.Integer(dump_only=True)
        now_application_guid = fields.UUID(dump_only=True)
        start_date = fields.DateTime(dump_only=True)
        end_date = fields.DateTime(dump_only=True)

    now_application_delay_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_delay_guid = db.Column(
        UUID(as_uuid=True), nullable=False, server_default=FetchedValue())

    now_application_guid = db.Column(
        db.Integer, db.ForeignKey('now_application_identity.now_application_guid'), nullable=False)
    now_application = db.relationship('NOWApplicationIdentity', overlaps='application_delays')

    #Reason for delay (behaves like type tables)
    delay_type_code = db.Column(
        db.String, db.ForeignKey('now_application_delay_type.delay_type_code'), nullable=False)
    start_comment = db.Column(db.String, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_comment = db.Column(db.String)
    end_date = db.Column(db.DateTime)

    def __repr__(self):
        return '<NOWApplicationDelay %r>' % self.now_application_delay_id

    @classmethod
    def create(cls,
               now_application,
               delay_type_code,
               start_comment,
               delay_start_date,
               add_to_session=True):
        new_now_delay = cls(
            delay_type_code=delay_type_code,
            comment=start_comment,
            start_date=delay_start_date,
        )

        now_application.application_delays.append(new_now_delay)
        if add_to_session:
            new_now_delay.save(commit=False)
        return new_now_delay

    @classmethod
    def find_by_guid(cls, guid):
        return cls.query.filter_by(now_application_delay_guid=guid).first()

    @validates('end_date')
    def validate_end_date(self, key, end_date):
        if end_date is not None:
            if isinstance(end_date, str):
                end_date = dateutil.parser.isoparse(end_date)
            if end_date < self.start_date:
                raise AssertionError('end_date cannot be before start_date')
        return end_date