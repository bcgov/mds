from datetime import datetime
import re
import uuid
import requests

from flask import request, current_app
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base

from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt_document_xref import MinePartyApptDocumentXref


class MinePartyAppointment(AuditMixin, Base):
    __tablename__ = "mine_party_appt"
    # Columns
    mine_party_appt_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_party_appt_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    mine_party_appt_type_code = db.Column(
        db.String(3), db.ForeignKey('mine_party_appt_type_code.mine_party_appt_type_code'))
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    processed_by = db.Column(db.String(60), server_default=FetchedValue())
    processed_on = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())

    #type specific foreign keys
    mine_tailings_storage_facility_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('mine_tailings_storage_facility.mine_tailings_storage_facility_guid'))
    permit_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit.permit_guid'))

    deleted_ind = db.Column(db.Boolean, server_default=FetchedValue())

    # Relationships
    party = db.relationship('Party', lazy='joined')

    mine_party_appt_type = db.relationship(
        'MinePartyAppointmentType',
        backref='mine_party_appt',
        order_by='desc(MinePartyAppointmentType.display_order)',
        lazy='joined')

    documents = db.relationship(
        'MineDocument', lazy='joined', secondary='mine_party_appt_document_xref')

    def assign_related_guid(self, related_guid):
        if self.mine_party_appt_type_code == "EOR":
            self.mine_tailings_storage_facility_guid = related_guid

        if self.mine_party_appt_type_code == "PMT":
            self.permit_guid = related_guid
        return

    def json(self, relationships=[]):
        result = {
            'mine_party_appt_guid': str(self.mine_party_appt_guid),
            'mine_guid': str(self.mine_guid),
            'party_guid': str(self.party_guid),
            'mine_party_appt_type_code': str(self.mine_party_appt_type_code),
            'start_date': str(self.start_date) if self.start_date else None,
            'end_date': str(self.end_date) if self.end_date else None,
            'documents': [doc.json() for doc in self.documents]
        }
        if 'party' in relationships:
            result.update({'party': self.party.json(show_mgr=False) if self.party else str({})})
        related_guid = ""
        if self.mine_party_appt_type_code == "EOR":
            related_guid = str(self.mine_tailings_storage_facility_guid)
        elif self.mine_party_appt_type_code == "PMT":
            related_guid = str(self.permit_guid)
        result["related_guid"] = related_guid
        return result

    # search methods
    @classmethod
    def find_by_mine_party_appt_guid(cls, _id):
        try:
            return cls.query.filter_by(mine_party_appt_guid=_id).filter_by(
                deleted_ind=False).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_guid(cls, _id):
        try:
            return cls.find_by(mine_guid=_id)
        except ValueError:
            return None

    @classmethod
    def find_by_party_guid(cls, _id):
        try:
            return cls.find_by(party_guid=_id)
        except ValueError:
            return None

    @classmethod
    def find_by_permit_guid(cls, _id):
        return cls.find_by(permit_guid=_id)


# given a permmit guid, and an issue date of a new amendment, order appointment start_dates
# return the all appointment start_dates in order

    @classmethod
    def find_appointment_end_dates(cls, _id, issue_datetime):
        start_dates = [issue_datetime]
        appointments = cls.find_by(permit_guid=_id)
        for appointment in appointments:
            start_dates.append(appointment.start_date)
        ordered_dates = sorted(start_dates, reverse=True)
        return ordered_dates

    @classmethod
    def find_parties_by_mine_party_appt_type_code(cls, code):
        try:
            return cls.find_by(mine_party_appt_type_codes=[code])
        except ValueError:
            return None

    @classmethod
    def find_current_appointments(cls,
                                  mine_guid=None,
                                  mine_party_appt_type_code=None,
                                  permit_guid=None,
                                  mine_tailings_storage_facility_guid=None):
        built_query = cls.query.filter_by(deleted_ind=False).filter_by(
            mine_guid=mine_guid).filter_by(
                mine_party_appt_type_code=mine_party_appt_type_code).filter_by(end_date=None)
        if permit_guid:
            built_query = built_query.filter_by(permit_guid=permit_guid)
        if mine_tailings_storage_facility_guid:
            built_query = built_query.filter_by(
                mine_tailings_storage_facility_guid=mine_tailings_storage_facility_guid)
        return built_query.all()

    @classmethod
    def find_by(cls,
                mine_guid=None,
                party_guid=None,
                mine_party_appt_type_codes=None,
                permit_guid=None):
        built_query = cls.query.filter_by(deleted_ind=False)
        if mine_guid:
            built_query = built_query.filter_by(mine_guid=mine_guid)
        if party_guid:
            built_query = built_query.filter_by(party_guid=party_guid)
        if permit_guid:
            built_query = built_query.filter_by(permit_guid=permit_guid)
        if mine_party_appt_type_codes:
            built_query = built_query.filter(
                cls.mine_party_appt_type_code.in_(mine_party_appt_type_codes))
        return built_query.all()

    @classmethod
    def to_csv(cls, records, columns):
        rows = [','.join(columns)]
        for record in records:
            row = []
            for column in columns:
                row.append(str(getattr(record, column)))
            rows.append(','.join(row))
        return '\n'.join(rows)

    @classmethod
    def create(cls,
               mine_guid,
               party_guid,
               mine_party_appt_type_code,
               processed_by,
               start_date=None,
               end_date=None,
               permit_guid=None,
               add_to_session=True):
        mpa = cls(
            mine_guid=mine_guid,
            party_guid=party_guid,
            permit_guid=permit_guid,
            mine_party_appt_type_code="PMT",
            start_date=start_date,
            end_date=end_date,
            processed_by=processed_by)
        if add_to_session:
            mpa.save(commit=False)
        return mpa

    # validators
    @validates('mine_guid')
    def validate_mine_guid(self, key, val):
        if not val:
            raise AssertionError('No mine guid provided.')
        return val

    @validates('party_guid')
    def validate_party_guid(self, key, val):
        if not val:
            raise AssertionError('No party guid provided.')
        return val

    @validates('mine_party_appt_type_code')
    def validate_mine_party_appt_type_code(self, key, val):
        if not val:
            raise AssertionError('No mine party appointment type code')
        if len(val) is not 3:
            raise AssertionError('invalid mine party appointment type code')
        return val

    @validates('mine_tailings_storage_facility_guid')
    def validate_mine_tailings_storage_facility_guid(self, key, val):
        if self.mine_party_appt_type_code == 'EOR':
            if not val:
                raise AssertionError(
                    'No mine_tailings_storage_facility_guid, but mine_party_appt_type_code is EOR.')
        return val

    @validates('permit_guid')
    def validate_permit_guid(self, key, val):
        if self.mine_party_appt_type_code == 'PMT':
            if not val:
                raise AssertionError('No permit_guid, but mine_party_appt_type_code is PMT.')
        return val
