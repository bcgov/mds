from datetime import datetime, timedelta
import uuid

from flask import request
from flask_restplus import Resource, reqparse
from sqlalchemy import or_

from ..models.party import Party
from ..models.mgr_appointment import MgrAppointment
from ....constants import PARTY_STATUS_CODE
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class PartyResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'first_name', type=str, help='First name of the party, if the party is a person.')
    parser.add_argument(
        'party_name',
        type=str,
        help='Last name of the party (Person), or the Organization name (Organization).')
    parser.add_argument(
        'phone_no', type=str, help='The phone number of the party. Ex: 123-123-1234')
    parser.add_argument('phone_ext', type=str, help='The extension of the phone number. Ex: 1234')
    parser.add_argument('email', type=str, help='The email of the party.')
    parser.add_argument('type', type=str, help='The type of the party. Ex: PER')

    PARTY_LIST_RESULT_LIMIT = 25

    @api.doc(
        params={
            'party_guid': 'Party guid. If not provided a list of 100 parties will be returned.',
            '?search':
            'Term searched in first name and party name, and 100 parties will be returned.',
            '?type': 'Search will filter for the type indicated.'
        })
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, party_guid=None):
        if party_guid:
            party = Party.find_by_party_guid(party_guid)
            if party:
                return party.json()
            else:
                return self.create_error_payload(404, 'Party not found'), 404
        else:
            search_term = request.args.get('search')
            search_type = request.args.get('type').upper() if request.args.get('type') else None
            if search_term:
                if search_type in ['PER', 'ORG']:
                    parties = Party.search_by_name(search_term, search_type,
                                                   self.PARTY_LIST_RESULT_LIMIT)
                else:
                    parties = Party.search_by_name(
                        search_term, query_limit=self.PARTY_LIST_RESULT_LIMIT)
            else:
                parties = Party.query.limit(self.PARTY_LIST_RESULT_LIMIT).all()
            return {'parties': list(map(lambda x: x.json(), parties))}

    def create_party_context(self, party_type_code, party_name, first_name):
        party_context = {'party_type_code': party_type_code, 'party_name': party_name}
        if party_type_code == PARTY_STATUS_CODE['per']:
            if not first_name:
                self.raise_error(400, 'Error: Party first name is not provided.')
            party_exists = Party.find_by_name(first_name, party_name)
            if party_exists:
                self.raise_error(
                    400, 'Error: Party with the name: {} {} already exists'.format(
                        first_name, party_name))
            party_context.update({
                'first_name': first_name,
            })
        elif party_type_code == PARTY_STATUS_CODE['org']:
            party_exists = Party.find_by_party_name(party_name)
            if party_exists:
                self.raise_error(
                    400, 'Error: Party with the party name: {} already exists'.format(party_name))
        else:
            self.raise_error(400, 'Error: Party type is not provided.')
        return party_context

    @api.expect(parser)
    @jwt.requires_roles(["mds-mine-create"])
    def post(self, party_guid=None):
        if party_guid:
            self.raise_error(400, 'Error: Unexpected party id in Url.')
        data = PartyResource.parser.parse_args()
        party_context = self.create_party_context(data['type'], data['party_name'],
                                                  data['first_name'])

        try:
            party = Party(
                party_guid=uuid.uuid4(),
                phone_no=data['phone_no'],
                email=data['email'],
                phone_ext=data['phone_ext'] if data['phone_ext'] else None,
                **self.get_create_update_dict(),
                **party_context)
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))

        party.save()
        return party.json()

    @api.expect(parser)
    @jwt.requires_roles(["mds-mine-create"])
    def put(self, party_guid):
        data = PartyResource.parser.parse_args()
        party_exists = Party.find_by_party_guid(party_guid)
        if not party_exists:
            return self.create_error_payload(404, 'Party not found'), 404
        party_type_code = data['type']
        if party_type_code == PARTY_STATUS_CODE['per']:
            first_name = data['first_name'] if data['first_name'] else party_exists.first_name
            party_name = data['party_name'] if data['party_name'] else party_exists.party_name
            party_name_exists = Party.find_by_name(first_name, party_name)
            if party_name_exists:
                self.raise_error(
                    400, 'Error: Party with the name: {} {} already exists'.format(
                        first_name, party_name))
            party_exists.first_name = first_name
            party_exists.party_name = party_name
        elif party_type_code == PARTY_STATUS_CODE['org']:
            party_name = data['party_name'] if data['party_name'] else party_exists.party_name
            party_name_exists = Party.find_by_party_name(party_name)
            if party_name_exists:
                self.raise_error(400,
                                 'Error: Party with the name: {} already exists'.format(party_name))
            party_exists.party_name = party_name
        else:
            self.raise_error(400, 'Error: Party type is not provided.')
        party_exists.save()
        return party_exists.json()
