from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class NOWApplication(Base, AuditMixin):
    __tablename__ = "now_application"

    now_application_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_guid = db.Column(UUID(as_uuid=True))
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    now_message_id = db.Column(db.Integer, nullable=False)
    now_tracking_number = db.Column(db.Integer)
    notice_of_work_type_code = db.Column(
        db.String,
        db.ForeignKey('notice_of_work_type_code.notice_of_work_type_code'),
        nullable=False)
    application_status_code = db.Column(
        db.String, db.ForeignKey('application_status_code.application_status_code'), nullable=False)
    submitted_date = db.Column(db.Date, nullable=False)
    received_date = db.Column(db.Date, nullable=False)
    latitude = db.Column(db.Numeric(9, 7))
    longitude = db.Column(db.Numeric(11, 7))
    property_name = db.Column(db.String)
    tenure_number = db.Column(db.String)
    description_of_land = db.Column(db.String)
    proposed_start_date = db.Column(db.Date)
    proposed_end_date = db.Column(db.Date)

    application_documents = db.relationship('NOWApplicationDocumentXref', lazy='joined')
    placer_operations = db.relationship(
        'PlacerOperation', lazy='select', secondary='now_application_place_xref')

    def __repr__(self):
        return '<Application %r>' % self.application_guid
