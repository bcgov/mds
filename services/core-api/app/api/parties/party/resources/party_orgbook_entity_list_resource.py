from flask_restplus import Resource
from werkzeug.exceptions import InternalServerError
from flask import current_app
from app.extensions import api
from app.api.utils.access_decorators import requires_role_edit_party
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.parties.party.models.party_orgbook_entity import PartyOrgBookEntity
from app.api.parties.response_models import PARTY_ORGBOOK_ENTITY
from app.api.services.orgbook_service import OrgBookService


class PartyOrgBookEntityListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'credential_id',
        type=int,
        help='The latest credential ID of the OrgBook entity to associate this party with.',
        required=True)

    @api.expect(parser)
    @api.doc(description='Create a Party OrgBook Entity.')
    # @requires_role_edit_party
    @api.marshal_with(PARTY_ORGBOOK_ENTITY, code=201)
    def post(self, party_guid):
        data = PartyOrgBookEntityListResource.parser.parse_args()
        credential_id = data.get('credential_id')

        resp = OrgBookService.credential_retrieve_formatted(credential_id)
        registration_id = resp['topic']['source_id']
        registration_status = not (resp['inactive'])
        registration_date = resp['effective_date']
        name_id = resp['names'][0]['id']
        name_text = resp['names'][0]['text']

        party_orgbook_entity = PartyOrgBookEntity.create(registration_id, registration_status,
                                                         registration_date, name_id, name_text,
                                                         credential_id, party_guid)

        if not party_orgbook_entity:
            raise InternalServerError('Failed to create the Party OrgBook Entity')

        party_orgbook_entity.save()

        return party_orgbook_entity, 201
