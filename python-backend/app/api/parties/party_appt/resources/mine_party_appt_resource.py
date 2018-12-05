from datetime import datetime, timedelta
import uuid

from flask import request
from flask_restplus import Resource, reqparse
from sqlalchemy import or_

from ..models.mine_party_appt import MinePartyAppointment
from ..models.mine_party_appt_type import MinePartyAppointmentType
from ....constants import PARTY_STATUS_CODE
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class MinePartyApptResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('mine_guid', type=str, help='guid of the mine.')
    parser.add_argument('party_guid', type=str, help='guid of the party.')
    parser.add_argument(
        'mine_party_appt_type_code',
        type=str,
        help='code for the type of appointment.')
    parser.add_argument('mine_tailings_storage_facility_guid', type=str)
    parser.add_argument(
        'start_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))
    parser.add_argument(
        'end_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))

    @api.doc(
        params={'mine_party_appt_guid': 'mine party appointment serial id'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_party_appt_guid=None):
        if mine_party_appt_guid:
            return MinePartyAppointment.find_by_mine_party_appt_guid(
                mine_party_appt_guid)
        else:
            mine_guid = request.args.get('mine_guid', type=str)
            party_guid = request.args.get('party_guid', type=str)
            mine_party_appt_type_code = request.args.get(
                'mine_party_appt_type_code', type=str)

            results = MinePartyAppointment.find_by(
                mine_guid=mine_guid,
                party_guid=party_guid,
                mine_party_appt_type_code=mine_party_appt_type_code)
            return list(map(lambda x: x.json(), results))

    @api.doc(
        params={'mine_party_appt_guid': 'mine party appointment serial id'})
    @jwt.requires_roles(["mds-mine-create"])
    def post(self, mine_party_appt_guid=None):
        if mine_party_appt_guid:
            return self.create_error_payload(
                400, 'unexpected mine party appointment guid'), 400
        data = self.parser.parse_args()
        new_mpa = MinePartyAppointment(
            mine_guid=data.get('mine_guid'),
            party_guid=data.get('party_guid'),
            mine_party_appt_type_code=data.get('mine_party_appt_type_code'),
            mine_tailings_storage_facility_guid=data.get(
                'mine_tailings_storage_facility_guid'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            **self.get_create_update_dict())
        new_mpa.save()
        return new_mpa.json()

    @api.doc(
        params={
            'mine_party_appt_guid':
            'mine party appointment guid, this endpoint only respects form data keys: start_date and end_date]'
        })
    @jwt.requires_roles(["mds-mine-create"])
    def put(self, mine_party_appt_guid=None):
        if not mine_party_appt_guid:
            return self.create_error_payload(
                400, 'expected mine party appointment guid'), 400
        data = self.parser.parse_args()
        mpa = MinePartyAppointment.find_by_mine_party_appt_guid(
            mine_party_appt_guid)
        if not mpa:
            return self.create_error_payload(
                404, 'mine party appointment not found'), 404
        #Only accepting these parameters
        mpa.start_date = data.get('start_date'),
        mpa.end_date = data.get('end_date'),
        mpa.save()
        return mpa.json()

    @api.doc(params={
        'mine_party_appt_guid':
        'mine party appointment guid to be deleted'
    })
    @jwt.requires_roles(["mds-mine-create"])
    def delete(self, mine_party_appt_guid=None):
        if not mine_party_appt_guid:
            return self.create_error_payload(
                400, 'expected mine party appointment guid'), 400
        data = self.parser.parse_args()
        mpa = MinePartyAppointment.find_by_mine_party_appt_guid(
            mine_party_appt_guid)
        if not mpa:
            return self.create_error_payload(
                404, 'mine party appointment not found'), 404
        mpa.active_ind = False
        mpa.save()
        return {
            'status': 200,
            'message': 'mine_party_appointment deleted successfully.'
        }
