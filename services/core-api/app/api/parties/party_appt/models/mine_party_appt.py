from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt_document_xref import MinePartyApptDocumentXref
from app.api.constants import PERMIT_LINKED_CONTACT_TYPES


class MinePartyAppointment(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_party_appt'

    mine_party_appt_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_party_appt_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    merged_from_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    mine_party_appt_type_code = db.Column(
        db.String(3), db.ForeignKey('mine_party_appt_type_code.mine_party_appt_type_code'))
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    processed_by = db.Column(db.String(60), server_default=FetchedValue())
    processed_on = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())

    # Type-specific properties
    mine_tailings_storage_facility_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('mine_tailings_storage_facility.mine_tailings_storage_facility_guid'))
    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'))
    permit = db.relationship('Permit', lazy='select')
    union_rep_company = db.Column(db.String)

    # Relationships
    party = db.relationship('Party', lazy='joined', foreign_keys=party_guid)
    merged_from_party = db.relationship('Party', lazy='joined', foreign_keys=merged_from_party_guid)
    mine_tailings_storage_facility = db.relationship('MineTailingsStorageFacility', lazy='joined')
    mine_party_appt_type = db.relationship(
        'MinePartyAppointmentType',
        backref='mine_party_appt',
        order_by='desc(MinePartyAppointmentType.display_order)',
        lazy='joined')
    documents = db.relationship(
        'MineDocument', lazy='joined', secondary='mine_party_appt_document_xref')

    def save(self, commit=True):
        def validate_mine():
            if self.mine_party_appt_type_code in PERMIT_LINKED_CONTACT_TYPES:
                if self.mine:
                    raise AssertionError(
                        'Mines cannot be associated with permit-linked contact types.')
            elif not self.mine:
                raise AssertionError(
                    'The associated mine is required for non permit-linked contact types.')

        def validate_permit():
            if self.mine_party_appt_type_code in PERMIT_LINKED_CONTACT_TYPES:
                if not self.permit:
                    raise AssertionError(
                        'The associated permit is required for permit-linked contact types.')
            elif self.permit:
                raise AssertionError(
                    'Permits cannot be associated with non permit-linked contact types.')

        def validate_tsf():
            if self.mine_party_appt_type_code == 'EOR':
                if not self.mine_tailings_storage_facility:
                    raise AssertionError('The associated TSF is required for Engineer of Records.')
            elif self.mine_tailings_storage_facility:
                raise AssertionError('TSFs can only be associated with Engineer of Records.')

        def validate_union_rep_company():
            if self.mine_party_appt_type_code == 'URP':
                if not self.union_rep_company:
                    raise AssertionError(
                        'The associated company/organization name is required for Union Reps.')

        validate_mine()
        validate_permit()
        validate_tsf()
        validate_union_rep_company()

        super(MinePartyAppointment, self).save(commit)

    def assign_related_guid(self, mine_party_appt_type_code, related_guid):
        from app.api.mines.permits.permit.models.permit import Permit
        from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility

        if mine_party_appt_type_code == 'EOR':
            tsf = MineTailingsStorageFacility.find_by_tsf_guid(related_guid)
            self.mine_tailings_storage_facility = tsf
            self.permit = None

        elif mine_party_appt_type_code in PERMIT_LINKED_CONTACT_TYPES:
            permit = Permit.find_by_permit_guid(related_guid)
            self.permit = permit
            self.mine = None
            self.mine_tailings_storage_facility = None

    def json(self, relationships=[]):
        result = {
            'mine_party_appt_guid': str(self.mine_party_appt_guid),
            'mine_party_appt_id': self.mine_party_appt_id,
            'mine_guid': str(self.mine_guid) if self.mine_guid else None,
            'party_guid': str(self.party_guid),
            'mine_party_appt_type_code': str(self.mine_party_appt_type_code),
            'start_date': str(self.start_date) if self.start_date else None,
            'end_date': str(self.end_date) if self.end_date else None,
            'union_rep_company': self.union_rep_company,
            'documents': [doc.json() for doc in self.documents]
        }
        if 'party' in relationships:
            result.update({'party': self.party.json(show_mgr=False) if self.party else str({})})

        related_guid = None
        if self.mine_party_appt_type_code == 'EOR':
            related_guid = str(self.mine_tailings_storage_facility_guid)
        elif self.mine_party_appt_type_code in PERMIT_LINKED_CONTACT_TYPES:
            related_guid = str(self.permit.permit_guid)
        result['related_guid'] = related_guid

        return result

    @classmethod
    def find_by_mine_party_appt_guid(cls, _id):
        try:
            return cls.query.filter_by(mine_party_appt_guid=_id).filter_by(
                deleted_ind=False).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_party_appt_id(cls, mine_party_appt_id):
        return cls.query.filter_by(mine_party_appt_id=mine_party_appt_id).filter_by(
            deleted_ind=False).one_or_none()

    # FIXME: This is only being used in one test, and is broken by permittee changes. Remove?
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
    def find_by_permit_id(cls, _id):
        return cls.query.filter_by(permit_id=_id).filter_by(deleted_ind=False).all()

    # Given a permit and an issue date of a new amendment, return the appointment start dates in descending order.
    @classmethod
    def find_appointment_end_dates(cls, _id, issue_datetime):
        start_dates = [issue_datetime]
        appointments = cls.find_by_permit_id(_id)
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
                                  permit_id=None,
                                  mine_tailings_storage_facility_guid=None):
        built_query = cls.query.filter_by(deleted_ind=False, mine_guid=mine_guid, end_date=None)
        if permit_id:
            built_query = built_query.filter_by(permit_id=permit_id)
        if mine_tailings_storage_facility_guid:
            built_query = built_query.filter_by(
                mine_tailings_storage_facility_guid=mine_tailings_storage_facility_guid)
        if isinstance(mine_party_appt_type_code, list):
            built_query = built_query.filter(
                cls.mine_party_appt_type_code.in_(mine_party_appt_type_code))
        else:
            built_query = built_query.filter_by(mine_party_appt_type_code=mine_party_appt_type_code)
        return built_query.all()

    @classmethod
    def find_by(cls,
                mine_guid=None,
                party_guid=None,
                mine_party_appt_type_codes=None,
                include_permit_contacts=False,
                active_only=True):
        built_query = cls.query.filter_by(deleted_ind=False)
        if mine_guid:
            built_query = built_query.filter_by(mine_guid=mine_guid)
        if party_guid:
            built_query = built_query.filter_by(party_guid=party_guid)
        if mine_party_appt_type_codes:
            built_query = built_query.filter(
                cls.mine_party_appt_type_code.in_(mine_party_appt_type_codes))
        results = built_query.all()

        if include_permit_contacts and mine_guid:
            #avoid circular imports.
            from app.api.mines.mine.models.mine import Mine
            mine = Mine.find_by_mine_guid(mine_guid)
            permit_contacts = []
            for mp in mine.mine_permit:
                if not active_only:
                    permit_contacts = permit_contacts + mp.permit_appointments
                else:
                    for pa in mp.permit_appointments:
                        if pa.end_date is None or (
                            (pa.start_date is None or pa.start_date <= datetime.utcnow().date())
                                and pa.end_date >= datetime.utcnow().date()):
                            permit_contacts.append(pa)
            results = results + permit_contacts
        return results

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
               mine,
               party_guid,
               processed_by,
               mine_party_appt_type_code,
               start_date=None,
               end_date=None,
               union_rep_company=None,
               permit=None,
               tsf=None,
               add_to_session=True):

        if mine_party_appt_type_code in PERMIT_LINKED_CONTACT_TYPES:
            mine = None
        else:
            permit = None

        if mine_party_appt_type_code != 'EOR':
            tsf = None

        mpa = cls(
            mine=mine,
            permit=permit,
            mine_tailings_storage_facility=tsf,
            party_guid=party_guid,
            mine_party_appt_type_code=mine_party_appt_type_code,
            start_date=start_date,
            end_date=end_date,
            union_rep_company=union_rep_company,
            processed_by=processed_by)

        if add_to_session:
            mpa.save(commit=False)
        return mpa
