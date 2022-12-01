from datetime import datetime, timedelta
from enum import Enum
from http.client import BAD_REQUEST

from flask import current_app
from sqlalchemy import and_, nullsfirst, nullslast
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt_document_xref import MinePartyApptDocumentXref
from app.api.constants import PERMIT_LINKED_CONTACT_TYPES, TSF_ALLOWED_CONTACT_TYPES


class MinePartyAppointmentStatus(str, Enum):
    active = 'active'
    pending = 'pending'
    inactive = 'inactive'

    def __str__(self):
        return self.value

class MinePartyAcknowledgedStatus(str, Enum):
    acknowledged = 'acknowledged'
    not_acknowledged = 'not_acknowledged'

    def __str__(self):
        return self.value

class MinePartyAppointment(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_party_appt'

    mine_party_appt_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_party_appt_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    merged_from_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    mine_party_appt_type_code = db.Column(
        db.String(3), db.ForeignKey('mine_party_appt_type_code.mine_party_appt_type_code'))

    status = db.Column(db.Enum(MinePartyAppointmentStatus), nullable=True)
    mine_party_acknowledgement_status = db.Column(db.Enum(MinePartyAcknowledgedStatus), nullable=True)

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
    merged_from_party = db.relationship('Party', foreign_keys=merged_from_party_guid)
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
            if self.mine_party_appt_type_code in TSF_ALLOWED_CONTACT_TYPES:
                if not self.mine_tailings_storage_facility:
                    raise AssertionError('The associated TSF is required for Engineer of Records or TSF Qualified Persons.')
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

        if mine_party_appt_type_code in TSF_ALLOWED_CONTACT_TYPES:
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
            'documents': [doc.json() for doc in self.documents],
            'status': MinePartyAppointmentStatus.__str__(self.status) if self.status else None,
            'mine_party_acknowledgement_status': MinePartyAcknowledgedStatus.__str__(self.mine_party_acknowledgement_status) if self.mine_party_acknowledgement_status else None,
        }

        if 'party' in relationships:
            result.update({'party': self.party.json(show_mgr=False) if self.party else str({})})

        related_guid = None
        if self.mine_party_appt_type_code in TSF_ALLOWED_CONTACT_TYPES:
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
    def update_status_many(cls, mine_party_appt_ids, status, commit=True):
        cls.query.filter(cls.mine_party_appt_id.in_(mine_party_appt_ids)).update({'status': status}, synchronize_session=False)

        if commit:
            db.session.commit()

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
    def find_expiring_appointments(cls, mine_party_appt_type_code, expiring_before_days):
        expiring_delta = datetime.utcnow() + timedelta(days=expiring_before_days)
        now = datetime.utcnow()

        qs = cls.query.filter_by(
            mine_party_appt_type_code=mine_party_appt_type_code,
            status=MinePartyAppointmentStatus.active
        ).filter(
            and_(MinePartyAppointment.end_date < expiring_delta, MinePartyAppointment.end_date > now)
        )

        return qs.all()

    @classmethod
    def find_expired_appointments(cls, mine_party_appt_type_code):
        now = datetime.utcnow()

        qs = cls.query.filter_by(
            mine_party_appt_type_code=mine_party_appt_type_code,
            status=MinePartyAppointmentStatus.active
        ).filter(MinePartyAppointment.end_date < now)

        return qs.all()

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

        if mine_party_appt_type_code == 'EOR':
            built_query = cls.query.filter_by(deleted_ind=False, mine_guid=mine_guid, status=MinePartyAppointmentStatus.active)
        else:
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
                active_only=True,
                mine_tailings_storage_facility_guid=None):
        built_query = cls.query.filter_by(deleted_ind=False)
        if mine_guid:
            built_query = built_query.filter_by(mine_guid=mine_guid)
        if party_guid:
            built_query = built_query.filter_by(party_guid=party_guid)
        if mine_tailings_storage_facility_guid:
            built_query = built_query.filter_by(mine_tailings_storage_facility_guid=mine_tailings_storage_facility_guid)
        if mine_party_appt_type_codes:
            built_query = built_query.filter(
                cls.mine_party_appt_type_code.in_(mine_party_appt_type_codes))
        results = built_query\
            .order_by(nullslast(cls.start_date.desc()), nullsfirst(cls.end_date.desc())) \
            .all()

        if include_permit_contacts and mine_guid:
            #avoid circular imports.
            from app.api.mines.mine.models.mine import Mine
            mine = Mine.find_by_mine_guid(mine_guid)
            permit_contacts = []
            for mp in mine.mine_permit:
                for pa in mp.permit_appointments:
                    if not pa.deleted_ind:
                        if not active_only:
                            permit_contacts.append(pa)
                        else:
                            if pa.end_date is None or (
                                    (pa.start_date is None or pa.start_date <= datetime.utcnow().date())
                                    and pa.end_date >= datetime.utcnow().date()):
                                permit_contacts.append(pa)

            results = results + permit_contacts
        return results

    def set_active(self):
        """
        Sets the current status of the party to active
        if this appointment starts later than the current appointment.
        updates the status of the previous appointment to inactive
        """
        if self.mine_party_appt_type_code == 'EOR':
            previous_mpa_ended = MinePartyAppointment.end_current(
                mine_guid=self.mine_guid,
                mine_party_appt_type_code=self.mine_party_appt_type_code,
                new_start_date=self.start_date,
                related_guid=self.mine_tailings_storage_facility_guid,
                permit=self.permit_id,
                validate_new_start_date=True,
                fail_on_no_appointments=False
            )

            if previous_mpa_ended:
                self.status = MinePartyAppointmentStatus.active

    @classmethod
    def end_current(cls, mine_guid, mine_party_appt_type_code, new_start_date, related_guid=None, permit=None, validate_new_start_date=False, fail_on_no_appointments=True):
        """
        Ends the current mine party appointment for the given mine/type.
        Returns True if the current appointment was ended otherwise False

        :param validate_new_start_date: Validate if the start date of the new appointment is after the start
            date of the old. Does not end the current appointment if that is the case
        :param fail_on_no_appointments: Fail softly if there's no current appointment
        """
        if mine_party_appt_type_code in TSF_ALLOWED_CONTACT_TYPES:
            current_mpa = MinePartyAppointment.find_current_appointments(
                mine_guid=mine_guid,
                mine_party_appt_type_code=mine_party_appt_type_code,
                mine_tailings_storage_facility_guid=related_guid)
        elif mine_party_appt_type_code in PERMIT_LINKED_CONTACT_TYPES:
            current_mpa = MinePartyAppointment.find_current_appointments(
                mine_party_appt_type_code=mine_party_appt_type_code, permit_id=permit.permit_id)
        else:
            current_mpa = MinePartyAppointment.find_current_appointments(
                mine_guid=mine_guid, mine_party_appt_type_code=mine_party_appt_type_code)

        if not fail_on_no_appointments and len(current_mpa) == 0:
            return True

        if len(current_mpa) != 1:
            raise BAD_REQUEST('There is currently not exactly one active appointment.')

        if validate_new_start_date and current_mpa[0].start_date and new_start_date < current_mpa[0].start_date:
            return False

        current_mpa[0].status = MinePartyAppointmentStatus.inactive
        current_mpa[0].end_date = new_start_date - timedelta(days=1)
        current_mpa[0].save()

        return True

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
               add_to_session=True,
               status=None,
               mine_party_acknowledgement_status=None):

        if mine_party_appt_type_code in PERMIT_LINKED_CONTACT_TYPES:
            mine = None
        else:
            permit = None

        if mine_party_appt_type_code not in TSF_ALLOWED_CONTACT_TYPES:
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
            processed_by=processed_by,
            status=status,
            mine_party_acknowledgement_status=mine_party_acknowledgement_status)

        if add_to_session:
            mpa.save(commit=False)
        return mpa