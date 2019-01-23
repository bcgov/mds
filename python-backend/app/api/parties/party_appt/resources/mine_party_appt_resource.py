from datetime import datetime, timedelta
import uuid

from flask import request
from flask_restplus import Resource, reqparse
from sqlalchemy import or_, exc as alch_exceptions

from ..models.mine_party_appt import MinePartyAppointment
from ..models.mine_party_appt_type import MinePartyAppointmentType
from ....constants import PARTY_STATUS_CODE
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin


class MinePartyApptResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('mine_guid', type=str, help='guid of the mine.')
    parser.add_argument('party_guid', type=str, help='guid of the party.')
    parser.add_argument('mine_party_appt_type_code', type=str, help='code for the type of appt.')
    parser.add_argument('related_guid', type=str)
    parser.add_argument('start_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))
    parser.add_argument('end_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))

    @api.doc(params={'mine_party_appt_guid': 'mine party appointment serial id'})
    @requires_role_mine_view
    def get(self, mine_party_appt_guid=None):
        if mine_party_appt_guid:
            mpa = MinePartyAppointment.find_by_mine_party_appt_guid(mine_party_appt_guid)
            if not mpa:
                self.raise_error(404, 'Mine Party Appointment not found')
            result = mpa.json()
        else:
            mine_guid = request.args.get('mine_guid')
            party_guid = request.args.get('party_guid')
            types = request.args.getlist('types')  #list
            mpas = MinePartyAppointment.find_by(
                mine_guid=mine_guid, party_guid=party_guid, mine_party_appt_type_codes=types)
            result = list(map(lambda x: x.json(), mpas))
        return result

    @api.doc(params={'mine_party_appt_guid': 'mine party appointment serial id'})
    @requires_role_mine_create
    def post(self, mine_party_appt_guid=None):
        if mine_party_appt_guid:
            return self.create_error_payload(400, 'unexpected mine party appointment guid'), 400
        data = self.parser.parse_args()
        try:
            new_mpa = MinePartyAppointment(
                mine_guid=data.get('mine_guid'),
                party_guid=data.get('party_guid'),
                mine_party_appt_type_code=data.get('mine_party_appt_type_code'),
                start_date=data.get('start_date'),
                end_date=data.get('end_date'),
                processed_by=self.get_user_info(),
                **self.get_create_update_dict())

            if new_mpa.mine_party_appt_type_code == "EOR":
                new_mpa.assign_related_guid(data.get('related_guid'))
                if not new_mpa.mine_tailings_storage_facility_guid:
                    raise AssertionError(
                        'mine_tailings_storage_facility_guid must be provided for Engineer of Record'
                    )
                #TODO move db foreign key constraint when services get separated
                pass

            if new_mpa.mine_party_appt_type_code == "PMT":
                new_mpa.assign_related_guid(data.get('related_guid'))
                if not new_mpa.permit_guid:
                    raise AssertionError('permit_guid must be provided for Permittee')
                #TODO move db foreign key constraint when services get separated
                pass

            new_mpa.save()
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))
        except alch_exceptions.IntegrityError as e:
            if "daterange_excl" in str(e):
                mpa_type_name = MinePartyAppointmentType.find_by_mine_party_appt_type_code(
                    data.get('mine_party_appt_type_code')).description
                self.raise_error(500, f'Error: Date ranges for {mpa_type_name} must not overlap')
            else:
                self.raise_error(500, "Error: {}".format(e))
        return new_mpa.json()

    @api.doc(
        params={
            'mine_party_appt_guid':
            'mine party appointment guid, this endpoint only respects form data keys: start_date and end_date]'
        })
    @requires_role_mine_create
    def put(self, mine_party_appt_guid=None):
        if not mine_party_appt_guid:
            return self.create_error_payload(400, 'missing mine party appointment guid'), 400
        data = self.parser.parse_args()
        mpa = MinePartyAppointment.find_by_mine_party_appt_guid(mine_party_appt_guid)
        if not mpa:
            return self.create_error_payload(404, 'mine party appointment not found'), 404
        # Only accepting these parameters
        mpa.start_date = data.get('start_date', mpa.start_date)
        mpa.end_date = data.get('end_date', mpa.end_date)
        if "related_guid" in data.keys():
            mpa.assign_related_guid(data.get('related_guid'))
        try:
            mpa.save()
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))
        except alch_exceptions.IntegrityError as e:
            if "daterange_excl" in str(e):
                mpa_type_name = mpa.mine_party_appt_type.description
                self.raise_error(500, f'Error: Date ranges for {mpa_type_name} must not overlap')

        return mpa.json()

    @api.doc(params={'mine_party_appt_guid': 'mine party appointment guid to be deleted'})
    @requires_role_mine_create
    def delete(self, mine_party_appt_guid=None):
        if not mine_party_appt_guid:
            return self.create_error_payload(400, 'expected mine party appointment guid'), 400
        data = self.parser.parse_args()
        mpa = MinePartyAppointment.find_by_mine_party_appt_guid(mine_party_appt_guid)
        if not mpa:
            return self.create_error_payload(404, 'mine party appointment not found'), 404
        mpa.deleted_ind = True
        mpa.save()
        return {'status': 200, 'message': 'mine_party_appointment deleted successfully.'}
