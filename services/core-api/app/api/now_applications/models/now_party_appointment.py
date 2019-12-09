from datetime import datetime
import uuid

from flask import request, current_app
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base

from app.api.parties.party.models.party import Party


class NOWPartyAppointment(AuditMixin, Base):
    __tablename__ = "now_party_appointment"
    # Columns
    now_party_appointment_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    now_party_appointment_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    mine_party_appt_type_code = db.Column(
        db.String(3), db.ForeignKey('mine_party_appt_type_code.mine_party_appt_type_code'))
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    deleted_ind = db.Column(db.Boolean, server_default=FetchedValue())

    # Relationships
    party = db.relationship('Party', lazy='joined')

    mine_party_appt_type = db.relationship(
        'MinePartyAppointmentType',
        backref='now_party_appointment',
        lazy='joined')