from datetime import datetime, timedelta
import json
import uuid

from flask import request, current_app
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointmentStatus
from app.api.activity.models.activity_notification import ActivityType
from app.api.utils.access_decorators import is_minespace_user
from flask_restplus import Resource
from sqlalchemy import and_, or_, exc as alch_exceptions
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound, Forbidden

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit, requires_any_of, MINE_EDIT, MINESPACE_PROPONENT, can_edit_mines
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment, MinePartyAppointmentStatus, \
    MinePartyAcknowledgedStatus
from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
from app.api.constants import PERMIT_LINKED_CONTACT_TYPES, TSF_ALLOWED_CONTACT_TYPES

from app.api.services.email_service import EmailService
from app.api.services.css_sso_service import CSSService
from app.config import Config
from app.api.activity.utils import trigger_notification


class MinePartyApptResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('mine_guid', type=str, help='guid of the mine.')
    parser.add_argument('party_guid', type=str, help='guid of the party.')
    parser.add_argument(
        'mine_party_appt_type_code',
        type=str,
        help='code for the type of appt.',
        store_missing=False)
    parser.add_argument(
        'mine_tailings_storage_facility_guid',
        type=str,
        help='GUID of tailings storage facility to filter by.',
        store_missing=False)
    parser.add_argument('related_guid', type=str, store_missing=False)
    parser.add_argument('end_current', type=bool)
    parser.add_argument(
        'start_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False)
    parser.add_argument(
        'end_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False)
    parser.add_argument(
        'union_rep_company',
        type=str,
        help='The company/organization of the Union Rep (applicable to this type only).',
        store_missing=False)
    parser.add_argument(
        'mine_party_acknowledgement_status',
        type=MinePartyAcknowledgedStatus,
        choices=list(MinePartyAcknowledgedStatus),
        help='Indicator of Ministry acknowledgement of the appointment.',
        store_missing=False)
    parser.add_argument(
        'status',
        type=MinePartyAppointmentStatus,
        choices=list(MinePartyAppointmentStatus),
        help='Indicator of status of acknowledgement.',
        store_missing=False)


    @api.doc(
        description='Returns a list of party appointments',
        params={
            'mine_party_appt_guid': 'Mine party appointment serial id',
            'mine_tailings_storage_facility_guid': 'GUID of tsf to filter by',
            'mine_guid': 'Mine serial id',
            'party_guid': 'Party serial id',
            'start_date': 'Date the mine appointment started',
            'end_date': "Date the mine appointment ended",
            'relationships': 'Relationship type - `party`'
        })
    @requires_role_view_all
    def get(self, mine_party_appt_guid=None):
        relationships = request.args.get('relationships')
        relationships = relationships.split(',') if relationships else []
        if mine_party_appt_guid:
            mpa = MinePartyAppointment.find_by_mine_party_appt_guid(mine_party_appt_guid)
            if not mpa:
                raise NotFound('Mine Party Appointment not found')
            result = mpa.json(relationships=relationships)
        else:
            mine_guid = request.args.get('mine_guid')
            party_guid = request.args.get('party_guid')
            include_permit_contacts = request.args.get(
                'include_permit_contacts', 'false').lower() == 'true' or request.args.get(
                    'include_permittees', 'false').lower() == 'true'
            act_only = request.args.get('active_only', 'true').lower() == 'true'
            types = request.args.getlist('types')

            mine_tailings_storage_facility_guid = request.args.get('mine_tailings_storage_facility_guid')

            mpas = MinePartyAppointment.find_by(
                mine_guid=mine_guid,
                party_guid=party_guid,
                mine_party_appt_type_codes=types,
                include_permit_contacts=include_permit_contacts,
                active_only=act_only,
                mine_tailings_storage_facility_guid=mine_tailings_storage_facility_guid)
            result = [x.json(relationships=relationships) for x in mpas]
        return result

    @api.doc(params={'mine_party_appt_guid': 'mine party appointment serial id'})
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    def post(self, mine_party_appt_guid=None):
        if mine_party_appt_guid:
            raise BadRequest('unexpected mine party appointment guid')

        data = self.parser.parse_args()

        end_current = data.get('end_current')
        party_guid = data.get('party_guid')
        mine_party_appt_type_code = data.get('mine_party_appt_type_code')
        related_guid = data.get('related_guid')
        mine_guid = data.get('mine_guid')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        union_rep_company = data.get('union_rep_company')

        party = Party.find_by_party_guid(party_guid)
        if party is None:
            raise NotFound('Party not found')

        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        permit = None
        tsf = None
        if mine_party_appt_type_code in PERMIT_LINKED_CONTACT_TYPES:
            permit = Permit.find_by_permit_guid(related_guid)
            if permit is None:
                raise NotFound('Permit not found')
        elif mine_party_appt_type_code in TSF_ALLOWED_CONTACT_TYPES:
            tsf = MineTailingsStorageFacility.find_by_tsf_guid(related_guid)
            if tsf is None:
                raise NotFound('TSF not found')

        if not can_edit_mines():
            # Make sure Minespace users can only assign EORs, associate pre-existing parties for the mine
            if mine_party_appt_type_code not in TSF_ALLOWED_CONTACT_TYPES:
                raise Forbidden("Minespace user can only appoint EORs and Qualified Persons")

            if not tsf or mine.mine_guid != tsf.mine_guid:
                raise Forbidden("TSF is not associated with the given mine")

            if not next((mem for mem in mine.mine_party_appt if party.party_guid == mem.party_guid), None):
                raise Forbidden("Party is not associated with the given mine")

        new_status = None
        mine_party_acknowledgement_status = None

        if is_minespace_user() and mine_party_appt_type_code == 'EOR':
            # EORs created through minespace should have a status of "pending"
            new_status = MinePartyAppointmentStatus.pending
            mine_party_acknowledgement_status = MinePartyAcknowledgedStatus.not_acknowledged
        elif mine_party_appt_type_code == 'EOR':
            mine_party_acknowledgement_status = MinePartyAcknowledgedStatus.acknowledged
        
        if end_current:
            new_status = MinePartyAppointmentStatus.active
            MinePartyAppointment.end_current(
                mine_guid=mine_guid,
                mine_party_appt_type_code=mine_party_appt_type_code,
                mine_tailings_storage_facility_guid=related_guid,
                permit_id=permit.permit_id,
                new_start_date=start_date
            )

        new_mpa = MinePartyAppointment.create(
            mine=mine,
            permit=permit,
            tsf=tsf,
            party_guid=party_guid,
            mine_party_appt_type_code=mine_party_appt_type_code,
            start_date=start_date,
            end_date=end_date,
            union_rep_company=union_rep_company,
            processed_by=self.get_user_info(),
            status=new_status,
            mine_party_acknowledgement_status=mine_party_acknowledgement_status)
        new_mpa.assign_related_guid(mine_party_appt_type_code, related_guid)

        try:
            new_mpa.save()
        except alch_exceptions.IntegrityError as e:
            if "daterange_excl" in str(e):
                mpa_type_name = MinePartyAppointmentType.find_by_mine_party_appt_type_code(
                    data.get('mine_party_appt_type_code')).description
                raise BadRequest(f'Date ranges for {mpa_type_name} must not overlap')

        if Config.ENVIRONMENT_NAME != 'prod':
            # TODO: Remove this once TSF functionality is ready to go live
            if mine_party_appt_type_code == "EOR":

                trigger_notification(f'A new Engineer of Record for {mine.mine_name} has been assigned and requires Ministry Acknowledgement to allow for the mine\'s compliance.', ActivityType.eor_created, mine, "EngineerOfRecord", tsf.mine_tailings_storage_facility_guid)

                minespace_body = open("app/templates/email/eor/minespace_new_eor_email.html", "r").read()
                minespace_context = {
                    "tsf_name": "Name of TSF",
                    "eor": {
                        "start_date": "April 1, 2023",
                        "first_name": "Steve",
                        "last_name": "Jobs"
                    },
                    "mine": {
                        "mine_name": "Big Ol Mine",
                        "mine_no": "123456"
                    },
                    "minespace_appt_link": "www.google.ca",
                    "minespace_login_link": "https://minespace.gov.bc.ca/"
                }
                subject = "email subject"

                recipients = CSSService.get_recipients_by_rolename("core_edit_tsf")
                EmailService.send_template_email(subject, recipients, minespace_body, minespace_context)
            if mine_party_appt_type_code == "TQP":
                trigger_notification(f'A new Qualified Person for {mine.mine_name} has been assigned.', ActivityType.qfp_created, mine, "QualifiedPerson", tsf.mine_tailings_storage_facility_guid)

        return new_mpa.json()

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

    @api.doc(
        params={
            'mine_party_appt_guid':
            'mine party appointment guid, this endpoint only respects form data keys: start_date and end_date, and related_guid'
        })
    @requires_role_mine_edit
    def put(self, mine_party_appt_guid=None):
        if not mine_party_appt_guid:
            raise BadRequest('missing mine party appointment guid')

        data = self.parser.parse_args()
        mpa = MinePartyAppointment.find_by_mine_party_appt_guid(mine_party_appt_guid)
        if not mpa:
            raise NotFound('mine party appointment not found')

        for key, value in data.items():
            if key in ['party_guid', 'mine_guid']:
                continue
            elif key == 'related_guid':
                related_guid = data.get('related_guid', None)
                mpa.assign_related_guid(mpa.mine_party_appt_type_code, related_guid)
            
            elif key == 'mine_party_acknowledgement_status' \
                    and value == MinePartyAcknowledgedStatus.acknowledged \
                    and mpa.status != MinePartyAppointmentStatus.active:
                # Make this appointment active if it has been acknowledged
                mpa.set_active()
                setattr(mpa, key, value)
            else:
                setattr(mpa, key, value)

        try:
            mpa.save()
        except alch_exceptions.IntegrityError as e:
            if "daterange_excl" in str(e):
                mpa_type_name = mpa.mine_party_appt_type.description
                raise BadRequest(f'Date ranges for {mpa_type_name} must not overlap.')

        return mpa.json()

    @api.doc(params={'mine_party_appt_guid': 'mine party appointment guid to be deleted'})
    @requires_role_mine_edit
    def delete(self, mine_party_appt_guid=None):
        if not mine_party_appt_guid:
            raise BadRequest('Expected mine party appointment guid.')

        data = self.parser.parse_args()
        mpa = MinePartyAppointment.find_by_mine_party_appt_guid(mine_party_appt_guid)
        if not mpa:
            raise NotFound('Mine party appointment not found.')

        mpa.deleted_ind = True
        mpa.save()

        return ('', 204)
