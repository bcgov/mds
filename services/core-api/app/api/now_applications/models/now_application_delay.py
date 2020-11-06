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
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    now_application = db.relationship('NOWApplication')

    delay_reason_code = db.Column(db.String, nullable=False)
    delay_comment = db.Column(db.String, nullable=False)
    delay_start_date = db.Column(db.Date, nullable=False)
    delay_end_date = db.Column(db.Date)

    def __repr__(self):
        return '<NOWApplicationDelay %r>' % self.now_application_delay_id