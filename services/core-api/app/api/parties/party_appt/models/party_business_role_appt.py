from datetime import datetime, timezone
from sqlalchemy import or_
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.parties.party_appt.models.party_business_role import PartyBusinessRole
from app.api.parties.party.models.party import Party
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


class PartyBusinessRoleAppointment(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "party_business_role_appt"
    # Columns
    party_business_role_appt_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    party_business_role_code = db.Column(
        db.String(32), db.ForeignKey('party_business_role_code.party_business_role_code'))
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    merged_from_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)

    # Relationships
    party = db.relationship('Party', lazy='selectin', foreign_keys=party_guid)
    merged_from_party = db.relationship('Party', foreign_keys=merged_from_party_guid)
    party_business_role = db.relationship(
        'PartyBusinessRole', backref='party_business_role_appt', lazy='selectin')

    @classmethod
    def find_by_business_role_appt_id(cls, _id):
        try:
            return cls.query.filter_by(party_business_role_appt_id=_id).filter_by(
                deleted_ind=False).first()
        except ValueError:
            return None

    @classmethod
    def find_by_party_guid(cls, _id):
        try:
            return cls.find_by(party_guid=_id)
        except ValueError:
            return None

    @classmethod
    def find_parties_by_business_role_code(cls, code):
        try:
            return cls.find_by(party_business_role_codes=[code])
        except ValueError:
            return None

    @classmethod
    def find_by(cls, party_guid=None, party_business_role_codes=None):
        built_query = cls.query.filter_by(deleted_ind=False)
        if party_guid:
            built_query = built_query.filter_by(party_guid=party_guid)
        if party_business_role_codes:
            built_query = built_query.filter(
                cls.party_business_role_code.in_(party_business_role_codes))
        return built_query.all()

    @classmethod
    def get_current_business_appointment(cls, party_guid, party_business_role_code):
        today = datetime.now(timezone.utc).date()
        return cls.query.filter_by(
            party_guid=party_guid, party_business_role_code=party_business_role_code).filter(
                PartyBusinessRoleAppointment.start_date <= today).filter(
                    or_(PartyBusinessRoleAppointment.end_date > today,
                        PartyBusinessRoleAppointment.end_date == None)).one_or_none()


    @classmethod
    def get_current_business_appointments(cls, party_guid, party_business_role_code):
        today = datetime.now(timezone.utc).date()
        return cls.query.filter_by(
            party_guid=party_guid).filter(PartyBusinessRoleAppointment.party_business_role_code.in_(party_business_role_code)).filter(
                PartyBusinessRoleAppointment.start_date <= today).filter(
                    or_(PartyBusinessRoleAppointment.end_date > today,
                        PartyBusinessRoleAppointment.end_date == None)).all()

    @classmethod
    def create(cls,
               party_business_role_code,
               party_guid,
               start_date=None,
               end_date=None,
               add_to_session=True):
        party_business_role_appt = cls(
            party_business_role_code=party_business_role_code,
            party_guid=party_guid,
            start_date=start_date,
            end_date=end_date)
        if add_to_session:
            party_business_role_appt.save(commit=False)
        return party_business_role_appt
