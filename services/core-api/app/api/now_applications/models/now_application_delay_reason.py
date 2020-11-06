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


class NOWApplicationDelayReason(Base, AuditMixin):
    __tablename__ = "now_application_delay_reason"
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]
    _edit_key = NOW_APPLICATION_EDIT_GROUP

    delay_reason_code = db.Column(db.String, primary_key=True, server_default=FetchedValue())
    description = db.Column(db.String, nullable=False)
    display_order = db.Column(db.Integer)
    active_ind = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return '<NOWApplicationDelayReason %r>' % self.delay_reason_code