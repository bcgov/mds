from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_edit_party
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.parties.party.models.party_orgbook_entity import PartyOrgBookEntity
from app.api.parties.response_models import PARTY_ORGBOOK_ENTITY


class PartyOrgBookEntityListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('registration_id', type=str, help='', required=True)
    parser.add_argument('registration_status', type=bool, help='', required=True)
    parser.add_argument('registration_date', type=str, help='', required=True)
    parser.add_argument('name_id', type=int, help='', required=True)
    parser.add_argument('name_text', type=str, help='', required=True)
    parser.add_argument('credential_id', type=int, help='', required=True)

    @api.expect(parser)
    @api.doc(description='Create a party OrgBook entity.')
    @requires_role_edit_party
    @api.marshal_with(PARTY_ORGBOOK_ENTITY, code=201)
    def post(self, party_guid):
        data = PartyOrgBookEntityListResource.parser.parse_args()

        party_orgbook_entity = PartyOrgBookEntity.create(
            data.get('registration_id'), data.get('registration_status'),
            data.get('registration_date'), data.get('name_id'), data.get('name_text'),
            data.get('credential_id'), party_guid)

        party_orgbook_entity.save()

        return party_orgbook_entity, 201
