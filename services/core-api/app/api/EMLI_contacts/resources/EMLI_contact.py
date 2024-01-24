from flask import current_app
from flask_restx import Resource, reqparse
from werkzeug.exceptions import NotFound, BadRequest
from app.extensions import api
from flask import request
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_edit_emli_contacts, requires_role_mine_admin, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.EMLI_contacts.response_models import EMLI_CONTACT_MODEL
from app.api.EMLI_contacts.models.EMLI_contact import EMLIContact
from app.api.EMLI_contacts.models.EMLI_contact_type import EMLIContactType


class EMLIContactResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('first_name', type=str, trim=True, help='EMLI First name', location='json')
    parser.add_argument('last_name', type=str, trim=True, help='EMLI Last name.', location='json')
    parser.add_argument('email', type=str, help='EMLI email.', required=True, location='json')
    parser.add_argument(
        'is_general_contact', type=bool, help='is is_general_contact? true/false', location='json')
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

    @api.doc(description='Update an existing EMLI contact.')
    @api.marshal_with(EMLI_CONTACT_MODEL)
    @requires_role_edit_emli_contacts
    def put(self, contact_guid):
        contact = EMLIContact.find_EMLI_contact_by_guid(contact_guid)
        if not contact:
            raise NotFound('Contact not found.')

        data = self.parser.parse_args()

        for key, value in data.items():
            setattr(contact, key, value)

        contact.save()

        return contact

    @api.doc(description='Delete an EMLI contact.')
    @api.marshal_with(EMLI_CONTACT_MODEL)
    @requires_role_mine_admin
    def delete(self, contact_guid):
        contact = EMLIContact.find_EMLI_contact_by_guid(contact_guid)
        if not contact:
            raise NotFound('Contact not found.')

        contact.deleted_ind = True
        current_app.logger.info(f'Deleting {contact}')

        contact.save()

        return None, 204

    @api.doc(description='Fetch EMLI contact information for specific user.')
    @api.marshal_with(EMLI_CONTACT_MODEL, code=201, envelope='records')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, contact_guid):
        contact = EMLIContact.find_EMLI_contact_by_guid(contact_guid)

        if not contact:
            raise NotFound('Contact not found.')
        
        return contact
