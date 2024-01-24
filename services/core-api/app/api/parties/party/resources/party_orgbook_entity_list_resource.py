import json
import requests
from flask_restx import Resource
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound, BadGateway

from app.extensions import api
from app.api.utils.access_decorators import requires_role_edit_party
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.parties.party.models.party_orgbook_entity import PartyOrgBookEntity
from app.api.parties.response_models import PARTY_ORGBOOK_ENTITY
from app.api.services.orgbook_service import OrgBookService
from app.api.parties.party.models.party import Party
from app.api.parties.party.models.party_orgbook_entity import PartyOrgBookEntity


class PartyOrgBookEntityListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'credential_id',
        type=int,
        help='The latest credential ID of the OrgBook entity to associate the party with.',
        required=True)

    @api.expect(parser)
    @api.doc(description='Create a Party OrgBook Entity.')
    @requires_role_edit_party
    @api.marshal_with(PARTY_ORGBOOK_ENTITY, code=201)
    def post(self, party_guid):
        party = Party.find_by_party_guid(party_guid)
        if party is None:
            raise NotFound('Party not found.')

        if PartyOrgBookEntity.find_by_party_guid(party_guid) is not None:
            raise BadRequest('This party is already associated with an OrgBook entity.')

        data = PartyOrgBookEntityListResource.parser.parse_args()
        credential_id = data.get('credential_id')

        if PartyOrgBookEntity.find_by_credential_id(credential_id) is not None:
            raise BadRequest('An OrgBook entity with the provided credential ID already exists.')

        resp = OrgBookService.get_credential(credential_id)
        if resp.status_code != requests.codes.ok:
            raise BadGateway(f'OrgBook API responded with {resp.status_code}: {resp.reason}')

        try:
            credential = json.loads(resp.text)
            registration_id = credential['topic']['source_id']
            registration_status = not (credential['inactive'])
            registration_date = credential['effective_date']
            name_id = credential['names'][0]['id']
            name_text = credential['names'][0]['text']
        except:
            raise BadGateway('OrgBook API responded with unexpected data.')

        party_orgbook_entity = PartyOrgBookEntity.create(registration_id, registration_status,
                                                         registration_date, name_id, name_text,
                                                         credential_id, party_guid)
        if not party_orgbook_entity:
            raise InternalServerError('Failed to create the Party OrgBook Entity.')

        party_orgbook_entity.save()

        party.party_name = name_text
        party.save()

        return party_orgbook_entity, 201
