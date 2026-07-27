from typing import Optional
from flask import request
from flask_restx import Resource, fields
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound, BadGateway
from pydantic import BaseModel, ValidationError

from app.extensions import api
from app.api.utils.access_decorators import requires_role_manage_orgbook
from app.api.utils.resources_mixins import UserMixin
from app.api.parties.party.models.party_bc_registration import PartyBCRegistration
from app.api.parties.response_models import PARTY_BC_REGISTRATION
from app.api.services.orgbook_service import OrgBookService
from app.api.parties.party.models.party import Party


class PartyBCRegistrationRequest(BaseModel):
    credential_id: Optional[int] = None
    registration_id: Optional[str] = None
    business_name: Optional[str] = None


PARTY_BC_REGISTRATION_REQUEST_MODEL = api.model(
    'PartyBCRegistrationRequest', {
        'credential_id':
        fields.Integer(
            description='The latest credential ID of the OrgBook entity to associate the party with.'
        ),
        'registration_id':
        fields.String(description='The Business Registration Id of the party record within CORE.'),
        'business_name':
        fields.String(
            description=
            'The Business Name (according to BC Registries) of the party record within CORE.'),
    })


class PartyBCRegistrationListResource(Resource, UserMixin):

    @api.doc(description="Create a Party OrgBook Entity. One of 'credential_id' or "
             "'registration_id' is required.")
    @api.expect(PARTY_BC_REGISTRATION_REQUEST_MODEL)
    @requires_role_manage_orgbook
    @api.marshal_with(PARTY_BC_REGISTRATION, code=201)
    def post(self, party_guid):

        party = Party.find_by_party_guid(party_guid)
        if party is None:
            raise NotFound('Party not found.')

        try:
            data = PartyBCRegistrationRequest.model_validate(request.get_json(silent=True) or {})
        except ValidationError as e:
            raise BadRequest(str(e))

        credential_id = data.credential_id
        registration_id = data.registration_id
        business_name = data.business_name

        if not credential_id and not registration_id:
            raise BadRequest("one of 'credential_id' or 'registration_id' must be provided ")

        if credential_id:
            credential = OrgBookService().get_credential(credential_id)
            try:
                registration_id = credential['topic']['source_id']
                registration_status = not (credential['inactive'])
                registration_date = credential['effective_date']
                name_id = credential['names'][0]['id']
                name_text = credential['names'][0]['text']
            except:
                raise BadGateway('OrgBook API responded with unexpected data.')

            party_bc_registration = PartyBCRegistration.create(party_guid, registration_id,
                                                               name_text, registration_status,
                                                               registration_date, name_id,
                                                               credential_id)
            if not party_bc_registration:
                raise InternalServerError('Failed to create the Party OrgBook Entity.')

        else:                                                                               # registration_id
            party_bc_registration = PartyBCRegistration.create(party_guid, registration_id,
                                                               business_name)
            party_bc_registration.data_source = "BC_REGISTRIES"
        party_bc_registration.save()
        party.save()

        return party_bc_registration, 201

    @api.doc(description='Delete a Party OrgBook Entity.')
    @requires_role_manage_orgbook
    def delete(self, party_guid):
        party_bc_registration = PartyBCRegistration.find_by_party_guid(party_guid)
        if party_bc_registration is None:
            raise NotFound('OrgBook entity not found.')

        party_bc_registration.delete()
        return None, 204
