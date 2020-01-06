from datetime import datetime
import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db


class NoticeOfWorkView(Base):
    __tablename__ = "notice_of_work_view"

    now_application_guid = db.Column(UUID(as_uuid=True), primary_key=True)

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    mine = db.relationship('Mine', lazy='joined')
    mine_no = db.Column(db.String)
    mine_name = association_proxy('mine', 'mine_name')
    mine_region = association_proxy('mine', 'mine_region')

    now_number = db.Column(db.String)

    lead_inspector_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=True)
    lead_inspector_name = db.Column(db.String)

    notice_of_work_type_description = db.Column(db.String)
    now_application_status_description = db.Column(db.String)

    received_date = db.Column(db.Date)
    originating_system = db.Column(db.String)

    def __repr__(self):
        return '<NoticeOfWorkView>'