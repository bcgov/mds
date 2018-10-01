from datetime import datetime, timedelta
import uuid

from flask import request
from flask_restplus import Resource, reqparse
from ..models.mines import MineIdentity
from ..models.party import Party, MgrAppointment
from ..models.constants import PARTY_STATUS_CODE
from app.extensions import jwt
from .mixins import UserMixin


class PartyResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('first_name', type=str)
    parser.add_argument('party_name', type=str)
    parser.add_argument('phone_no', type=str)
    parser.add_argument('phone_ext', type=str)
    parser.add_argument('email', type=str)
    parser.add_argument('type', type=str)

    @jwt.requires_roles(["mds-mine-view"])
    def get(self, party_guid):
        party = Party.find_by_party_guid(party_guid)
        if party:
            return party.json()
        return {
            'error': {
                'status': 404,
                'message': 'Party not found'
            }
        }, 404

    @jwt.requires_roles(["mds-mine-create"])
    def post(self, party_guid=None):
        if party_guid:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: Unexpected party id in Url.'
                }
            }, 400
        data = PartyResource.parser.parse_args()
        party_type_code = data['type']
        party_context = {
            'party_type_code': party_type_code,
            'party_name': data['party_name']
        }
        if party_type_code == PARTY_STATUS_CODE['per']:
            if not data['first_name']:
                return {
                    'error': {
                        'status': 400,
                        'message': 'Error: Party first name is not provided.'
                    }
                }, 400
            party_exists = Party.find_by_name(data['first_name'], data['party_name'])
            if party_exists:
                return {
                    'error': {
                        'status': 400,
                        'message': 'Error: Party with the name: {} {} already exists'.format(data['first_name'], data['party_name'])
                    }
                }, 400
            party_context.update({
                'first_name': data['first_name'],
            })
        elif party_type_code == PARTY_STATUS_CODE['org']:
            party_exists = Party.find_by_nmae(data['party_name'])
            if party_exists:
                return {
                    'error': {
                        'status': 400,
                        'message': 'Error: Party with the party name: {} already exists'.format(data['party_name'])
                    }
                }, 400
        else:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: Party type is not provided.'
                }
            }, 400

        try:
            party = Party(
                party_guid=uuid.uuid4(),
                phone_no=data['phone_no'],
                email=data['email'],
                phone_ext=data['phone_ext'] if data['phone_ext'] else None,
                **self.get_create_update_dict(),
                **party_context
            )
        except AssertionError as e:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: {}'.format(e)
                }
            }, 400
        party.save()
        return party.json()

    @jwt.requires_roles(["mds-mine-create"])
    def put(self, party_guid):
        data = PartyResource.parser.parse_args()
        party_exists = Party.find_by_party_guid(party_guid)
        if not party_exists:
            return {
                'error': {
                    'status': 404,
                    'message': 'Party not found'
                }
            }, 404
        party_type_code = data['type']
        if party_type_code == PARTY_STATUS_CODE['per']:
            first_name = data['first_name'] if data['first_name'] else party_exists.first_name
            party_name = data['party_name'] if data['party_name'] else party_exists.party_name
            party_name_exists = Party.find_by_name(first_name, party_name)
            if party_name_exists:
                return {
                    'error': {
                        'status': 400,
                        'message': 'Error: Party with the name: {} {} already exists'.format(first_name, party_name)
                    }
                }, 400
            party_exists.first_name = first_name
            party_exists.party_name = party_name
        elif party_type_code == PARTY_STATUS_CODE['org']:
            party_name = data['party_name'] if data['party_name'] else party_exists.party_name
            party_name_exists = Party.find_by_party_name(party_name)
            if party_name_exists:
                return {
                    'error': {
                        'status': 400,
                        'message': 'Error: Party with the name: {} already exists'.format(party_name)
                    }
                }, 400
            party_exists.party_name = party_name
        else:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: Party type is not provided.'
                }
            }, 400
        party_exists.save()
        return party_exists.json()


class ManagerResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('party_guid', type=str)
    parser.add_argument('mine_guid', type=str)
    parser.add_argument('effective_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))

    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mgr_appointment_guid):
        manager = MgrAppointment.find_by_mgr_appointment_guid(mgr_appointment_guid)
        if manager:
            return manager.json()
        return {
            'error': {
                'status': 404,
                'message': 'Manager not found'
            }
        }, 404

    @jwt.requires_roles(["mds-mine-create"])
    def post(self, mgr_appointment_guid=None):
        if mgr_appointment_guid:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: Unexpected manager id in Url.'
                }
            }, 400
        data = ManagerResource.parser.parse_args()
        if not data['party_guid']:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: Party guid is not provided.'
                }
            }, 400
        if not data['mine_guid']:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: Mine guid is not provided.'
                }
            }, 400
        if not data['effective_date']:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: Effective date is not provided.'
                }
            }, 400
        # Validation for mine and party exists
        party_exists = Party.find_by_party_guid(data['party_guid'])
        if not party_exists:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: Party with guid: {}, does not exist.'.format(data['party_guid'])
                }
            }, 400
        mine_exists = MineIdentity.find_by_mine_guid(data['mine_guid'])
        if not mine_exists:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: Mine with guid: {}, does not exist.'.format(data['mine_guid'])
                }
            }, 400
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
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: {}'.format(e)
                }
            }, 400
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


class PartyList(Resource):
    @jwt.requires_roles(["mds-mine-view"])
    def get(self):
        return {'parties': list(map(lambda x: x.json(), Party.query.all()))}


class PartyListSearch(Resource):
    PARTY_LIST_RESULT_LIMIT = 100

    @jwt.requires_roles(["mds-mine-view"])
    def get(self):
        search_term = request.args.get('search')
        search_type = request.args.get('type')
        if search_type == 'per':
            if search_term:
                first_name_filter = Party.first_name.ilike('%{}%'.format(search_term))
                party_name_filter = Party.party_name.ilike('%{}%'.format(search_term))
                parties = Party.query.filter(first_name_filter | party_name_filter).limit(self.PARTY_LIST_RESULT_LIMIT).all()
            else:
                parties = Party.query.limit(self.PARTY_LIST_RESULT_LIMIT).all()
        else:
            if search_term:
                party_name_filter = Party.party_name.ilike('%{}%'.format(search_term))
                parties = Party.query.filter(party_name_filter).limit(self.PARTY_LIST_RESULT_LIMIT).all()
            else:
                parties = Party.query.limit(self.PARTY_LIST_RESULT_LIMIT).all()

        return {'parties': list(map(lambda x: x.json(), parties))}
