from flask_restplus import Resource
from werkzeug.exceptions import BadRequest
from app.extensions import api
from flask import request
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import requires_role_edit_emli_contacts, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.api.emli_contacts.models.emli_contact import emliContact
from app.api.emli_contacts.models.emli_contact_type import emliContactType
from app.api.emli_contacts.response_models import EMLI_CONTACT_MODEL


class emliContactListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'emli_contact_type_code',
        type=str,
        trim=True,
        help='EMLI contact type code',
        location='json')
    parser.add_argument(
        'mine_region_code', type=str, trim=True, help='EMLI mine region code', location='json')
    parser.add_argument('first_name', type=str, trim=True, help='EMLI First name', location='json')
    parser.add_argument('last_name', type=str, trim=True, help='EMLI Last name.', location='json')
    parser.add_argument('email', type=str, help='EMLI email.', required=True, location='json')
    parser.add_argument(
        'phone_number', type=str, help='EMLI phone number', required=True, location='json')
    parser.add_argument(
        'fax_number', type=str, help='EMLI Regional Office fax number', location='json')
    parser.add_argument(
        'mailing_address_line_1',
        type=str,
        help='EMLI Regional Office mailing address line 1',
        location='json')
    parser.add_argument(
        'mailing_address_line_2',
        type=str,
        help='EMLI Regional Office mailing address line 2',
        location='json')
    parser.add_argument(
        'is_major_mine', type=bool, help='is major mine contact? true/false', location='json')
    parser.add_argument(
        'is_general_contact', type=bool, help='is is_general_contact? true/false', location='json')
    parser.add_argument(
        'deleted_ind', type=bool, help='Deleted indicator: true/false', location='json')

    @api.doc(
        params={'is_major_mine': 'EMLI user is related to a major mine? true/false'},
        description='Returns all EMLI contacts information.')
    @api.marshal_with(EMLI_CONTACT_MODEL, code=201, envelope='records')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_region_code=None):
        is_major_mine = request.args.get('is_major_mine') == 'true'

        if mine_region_code:
            return emliContact.find_emli_contacts_by_mine_region(mine_region_code, is_major_mine)

        return emliContact.get_all(is_major_mine)

    @api.doc(description='Create a EMLI contact.')
    @api.expect(parser)
    @api.marshal_with(EMLI_CONTACT_MODEL, code=200)
    @requires_role_edit_emli_contacts
    def post(self):
        data = self.parser.parse_args()

        contact_type = data.get('emli_contact_type_code', None)
        is_major_mine = data.get('is_major_mine', None)
        is_general_contact = data.get('is_general_contact', None)
        contact_desc = emliContactType.find_contact_type(contact_type)

        mmo_contact = emliContact.find_emli_contact('MMO')
        chief_inspector = emliContact.find_emli_contact('CHI')
        chief_permitting = emliContact.find_emli_contact('CHP')
        roe_contact = emliContact.find_emli_contact('ROE', data.mine_region_code)

        unique_by_region = roe_contact.emli_contact_type_code if roe_contact else None
        unique_global = [
            mmo_contact.emli_contact_type_code if mmo_contact is not None else None,
            chief_inspector.emli_contact_type_code if chief_inspector is not None else None,
            chief_permitting.emli_contact_type_code if chief_permitting is not None else None
        ]

        if unique_by_region and contact_type in unique_by_region:
            raise BadRequest(
                f'Error: Restricted to one {contact_desc[0].description} contact by mine region.')

        elif unique_global and contact_type in unique_global:
            raise BadRequest(f'Error: Restricted to one {contact_desc[0].description} contact.')

        elif is_major_mine == False and is_general_contact == True:
            raise BadRequest(f'Error: General contacts must be a major mine contact.')

        contact = emliContact.create(
            emli_contact_type_code=contact_type,
            mine_region_code=data.get('mine_region_code'),
            first_name=data.get('first_name', None),
            last_name=data.get('last_name', None),
            email=data.get('email'),
            phone_number=data.get('phone_number'),
            fax_number=data.get('fax_number', None),
            mailing_address_line_1=data.get('mailing_address_line_1', None),
            mailing_address_line_2=data.get('mailing_address_line_2', None),
            is_major_mine=data.get('is_major_mine', False),
            is_general_contact=data.get('is_general_contact', False),
            deleted_ind=data.get('deleted_ind', False))

        if not contact:
            raise BadRequest('Error: Failed to create EMLI contact.')

        contact.save()

        return contact
