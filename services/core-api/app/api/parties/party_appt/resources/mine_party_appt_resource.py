from datetime import datetime, timedelta
import uuid

from flask import request, current_app
from flask_restplus import Resource
from sqlalchemy import or_, exc as alch_exceptions
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType
from app.api.constants import PERMIT_LINKED_CONTACT_TYPES


class MinePartyApptResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('mine_guid', type=str, help='guid of the mine.')
    parser.add_argument('party_guid', type=str, help='guid of the party.')
    parser.add_argument(
        'mine_party_appt_type_code',
        type=str,
        help='code for the type of appt.',
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

    @api.doc(
        description='Returns a list of party appointments',
        params={
            'mine_party_appt_guid': 'Mine party appointment serial id',
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
            permit_guid = request.args.get('permit_guid')
            incl_pmt = request.args.get('include_permittees', 'false').lower() == 'true'
            act_only = request.args.get('active_only', 'true').lower() == 'true'
            types = request.args.getlist('types') #list
            mpas = MinePartyAppointment.find_by(
                mine_guid=mine_guid,
                party_guid=party_guid,
                mine_party_appt_type_codes=types,
                include_permittees=incl_pmt,
                active_only=act_only)
            result = [x.json(relationships=relationships) for x in mpas]
        return result

    @api.doc(params={'mine_party_appt_guid': 'mine party appointment serial id'})
    @requires_role_mine_edit
    def post(self, mine_party_appt_guid=None):
        if mine_party_appt_guid:
            raise BadRequest('unexpected mine party appointment guid')
        data = self.parser.parse_args()

        end_current = data.get('end_current')
        mine_party_appt_type_code = data.get('mine_party_appt_type_code')
        related_guid = data.get('related_guid')
        mine_guid = data.get('mine_guid')
        start_date = data.get('start_date')
        mine = Mine.find_by_mine_guid(mine_guid)
        if end_current:
            if mine_party_appt_type_code == "EOR":
                current_mpa = MinePartyAppointment.find_current_appointments(
                    mine_guid=mine_guid,
                    mine_party_appt_type_code=mine_party_appt_type_code,
                    mine_tailings_storage_facility_guid=related_guid)
            elif mine_party_appt_type_code in PERMIT_LINKED_CONTACT_TYPES:
                permit = Permit.find_by_permit_guid(related_guid)
                current_mpa = MinePartyAppointment.find_current_appointments(
                    mine_party_appt_type_code=mine_party_appt_type_code, permit_id=permit.permit_id)
            else:
                current_mpa = MinePartyAppointment.find_current_appointments(
                    mine_guid=mine_guid, mine_party_appt_type_code=mine_party_appt_type_code)
            if len(current_mpa) != 1:
                raise BadRequest('There is currently not exactly one active appointment.')
            current_mpa[0].end_date = start_date - timedelta(days=1)
            current_mpa[0].save()
        new_mpa = MinePartyAppointment.create(
            mine=mine if mine_party_appt_type_code not in PERMIT_LINKED_CONTACT_TYPES else None,
            party_guid=data.get('party_guid'),
            mine_party_appt_type_code=mine_party_appt_type_code,
            start_date=start_date,
            end_date=data.get('end_date'),
            processed_by=self.get_user_info())

        if new_mpa.mine_party_appt_type_code == "EOR":
            new_mpa.assign_related_guid(related_guid)
            if not new_mpa.mine_tailings_storage_facility_guid:
                raise AssertionError(
                    'mine_tailings_storage_facility_guid must be provided for Engineer of Record')
            #TODO move db foreign key constraint when services get separated
            pass
        if new_mpa.mine_party_appt_type_code in PERMIT_LINKED_CONTACT_TYPES:
            new_mpa.assign_related_guid(related_guid)
            if not new_mpa.permit_id:
                raise AssertionError('permit_guid must be provided for Permittee')
            #TODO move db foreign key constraint when services get separated
            pass
        try:
            new_mpa.save()
        except alch_exceptions.IntegrityError as e:
            if "daterange_excl" in str(e):
                mpa_type_name = MinePartyAppointmentType.find_by_mine_party_appt_type_code(
                    data.get('mine_party_appt_type_code')).description
                raise BadRequest(f'Date ranges for {mpa_type_name} must not overlap')
        return new_mpa.json()

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
            elif key == "related_guid":
                related_guid = data.get('related_guid', None)
                if mpa.mine_party_appt_type_code in ['THD', 'LDO', 'MOR'
                                                     ] and mpa.mine_guid and not related_guid:
                    continue
                else:
                    mpa.assign_related_guid(data.get('related_guid'))
                    mpa.mine_guid = None
                    mpa.mine = None
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
