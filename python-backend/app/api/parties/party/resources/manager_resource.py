from datetime import datetime, timedelta
import uuid

from flask import request
from flask_restplus import Resource, reqparse
from sqlalchemy import or_

from ....mines.mine.models.mine_identity import MineIdentity
from ..models.party import Party
from ..models.mgr_appointment import MgrAppointment
from ....constants import PARTY_STATUS_CODE
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin

class ManagerResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('party_guid', type=str, help='Party guid.')
    parser.add_argument('mine_guid', type=str, help='Mine guid.')
    parser.add_argument('effective_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'), help='Effective date. In the format of YYYY-MM-DD.')

    @api.doc(params={'mgr_appointment_guid': 'Manager guid.'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mgr_appointment_guid):
        manager = MgrAppointment.find_by_mgr_appointment_guid(mgr_appointment_guid)
        if manager:
            return manager.json()
        return self.create_error_payload(404, 'Manager not found'), 404

    @api.expect(parser)
    @jwt.requires_roles(["mds-mine-create"])
    def post(self, mgr_appointment_guid=None):
        if mgr_appointment_guid:
            self.raise_error(400, 'Error: Unexpected manager id in Url.')
        data = ManagerResource.parser.parse_args()
        if not data['party_guid']:
            self.raise_error(400, 'Error: Party guid is not provided.')
        if not data['mine_guid']:
            self.raise_error(400, 'Error: Mine guid is not provided.')
        if not data['effective_date']:
            self.raise_error(400, 'Error: Effective date is not provided.')
        # Validation for mine and party exists
        party_exists = Party.find_by_party_guid(data['party_guid'])
        if not party_exists:
            self.raise_error(400, 'Error: Party with guid: {}, does not exist.'.format(data['party_guid']))
        mine_exists = MineIdentity.find_by_mine_guid(data['mine_guid'])
        if not mine_exists:
            self.raise_error(400, 'Error: Mine with guid: {}, does not exist.'.format(data['mine_guid']))
        # Check if there is a previous manager, set expiry the day before new manager
        previous_mgr_expiry_date = data['effective_date'] - timedelta(days=1)
        previous_mgrs = mine_exists.mgr_appointment
        if previous_mgrs:
            previous_mgr_info = previous_mgrs[0]
            previous_mgr = MgrAppointment.find_by_mgr_appointment_guid(previous_mgr_info.mgr_appointment_guid)
            previous_mgr.expiry_date = previous_mgr_expiry_date
            previous_mgr.save()
        try:
            manager = MgrAppointment(
                mgr_appointment_guid=uuid.uuid4(),
                party_guid=data['party_guid'],
                mine_guid=data['mine_guid'],
                effective_date=data['effective_date'],
                **self.get_create_update_dict()
            )
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))
        manager.save()
        party_context = {}
        if party_exists.party_type_code == PARTY_STATUS_CODE['per']:
            party_context.update({
                'name': party_exists.first_name + ' ' + party_exists.party_name
            })
        elif party_exists.party_type_code == PARTY_STATUS_CODE['org']:
            party_context.update({
                'name': party_exists.party_name
            })
        return {
            'party_guid': str(manager.party_guid),
            'mgr_appointment_guid': str(manager.mgr_appointment_guid),
            'mine_guid': str(manager.mine_guid),
            'effective_date': str(manager.effective_date),
            'expiry_date': str(manager.expiry_date),
        }
