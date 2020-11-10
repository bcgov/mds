import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db

from app.api.now_submissions.models.application import Application
from app.api.mms_now_submissions.models.application import MMSApplication
from app.api.constants import *


class NOWApplicationDelay(Base, AuditMixin):
    __tablename__ = "now_application_delay"
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]
    _edit_key = NOW_APPLICATION_EDIT_GROUP

    now_application_delay_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_delay_guid = db.Column(
        UUID(as_uuid=True), nullable=False, server_default=FetchedValue())

    now_application_guid = db.Column(db.Integer,
                                     db.ForeignKey('now_application_identity.now_application_guid'))
    now_application = db.relationship('NOWApplicationIdentity')

    #Reason for delay (behaves like type tables)
    delay_type_code = db.Column(
        db.String, db.ForeignKey('now_application_delay_type.delay_type_code'), nullable=False)
    comment = db.Column(db.String, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)

    def __repr__(self):
        return '<NOWApplicationDelay %r>' % self.now_application_delay_id

    @classmethod
    def create(cls,
               now_application,
               delay_type_code,
               delay_comment,
               delay_start_date,
               add_to_session=True):
        new_now_delay = cls(
            delay_type_code=delay_type_code,
            comment=delay_comment,
            start_date=delay_start_date,
        )

        now_application.application_delays.append(new_now_delay)
        if add_to_session:
            new_now_delay.save(commit=False)
        return new_now_delay
