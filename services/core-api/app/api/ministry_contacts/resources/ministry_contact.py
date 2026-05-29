from flask import current_app
from flask_restx import Resource, reqparse
from werkzeug.exceptions import NotFound, BadRequest
from app.extensions import api
from flask import request
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_edit_ministry_contacts, requires_role_mine_admin, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.ministry_contacts.response_models import MINISTRY_CONTACT_MODEL
from app.api.ministry_contacts.models.ministry_contact import MinistryContact
from app.api.ministry_contacts.models.ministry_contact_type import MinistryContactType


class MinistryContactResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('first_name', type=str, trim=True, help='MCM First name', location='json')
    parser.add_argument('last_name', type=str, trim=True, help='MCM Last name.', location='json')
    parser.add_argument('email', type=str, help='MCM email.', required=True, location='json')
    parser.add_argument(
        'is_general_contact', type=bool, help='is is_general_contact? true/false', location='json')
    parser.add_argument(
        'phone_number', type=str, help='MCM phone number', required=True, location='json')
    parser.add_argument(
        'fax_number', type=str, help='MCM Regional Office fax number', location='json')
    parser.add_argument(
        'mailing_address_line_1',
        type=str,
        help='MCM Regional Office mailing address line 1',
        location='json')
    parser.add_argument(
        'mailing_address_line_2',
        type=str,
        help='MCM Regional Office mailing address line 2',
        location='json')
    parser.add_argument(
        'distribution_list_guids', type=list, location='json', default=[])

    @api.doc(description='Update an existing MCM contact.')
    @api.marshal_with(MINISTRY_CONTACT_MODEL)
    @requires_role_edit_ministry_contacts
    def put(self, contact_guid):
        contact = MinistryContact.find_ministry_contact_by_guid(contact_guid)
        if not contact:
            raise NotFound('Contact not found.')

        data = self.parser.parse_args()

        distribution_list_guids = data.pop('distribution_list_guids', [])
        
        for key, value in data.items():
            setattr(contact, key, value)

        from app.api.ministry_contacts.models.distribution_list_user import DistributionListUser
        
        # Soft delete existing records
        existing_dlu = DistributionListUser.find_by_contact_guid(contact.contact_guid)
        for dlu in existing_dlu:
            if str(dlu.distribution_list_guid) not in distribution_list_guids:
                dlu.deleted_ind = True
                dlu.save(commit=False)
                
        # Add new records
        existing_guids = [str(dlu.distribution_list_guid) for dlu in existing_dlu if not dlu.deleted_ind]
        for guid in distribution_list_guids:
            if guid not in existing_guids:
                DistributionListUser.create(guid, contact.contact_guid, add_to_session=True)

        contact.save()

        return contact

    @api.doc(description='Delete an MCM contact.')
    @api.marshal_with(MINISTRY_CONTACT_MODEL)
    @requires_role_mine_admin
    def delete(self, contact_guid):
        contact = MinistryContact.find_ministry_contact_by_guid(contact_guid)
        if not contact:
            raise NotFound('Contact not found.')

        contact.deleted_ind = True
        current_app.logger.info(f'Deleting {contact}')

        contact.save()

        return None, 204

    @api.doc(description='Fetch MCM contact information for specific user.')
    @api.marshal_with(MINISTRY_CONTACT_MODEL, code=201, envelope='records')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, contact_guid):
        contact = MinistryContact.find_ministry_contact_by_guid(contact_guid)

        if not contact:
            raise NotFound('Contact not found.')
        
        return contact
