from werkzeug.exceptions import NotFound
from flask_restplus import Resource, inputs

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINE_EDIT, MINESPACE_PROPONENT, MINE_ADMIN
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.explosives_permit.response_models import EXPLOSIVES_PERMIT_MODEL
from app.api.mines.explosives_permit.models.explosives_permit import ExplosivesPermit


class ExplosivesPermitResource(Resource, UserMixin):
    parser = CustomReqparser()

    @api.doc(
        description='Get an Explosives Permit.',
        params={
            'mine_guid': 'The GUID of the mine the Explosives Permit belongs to.',
            'explosives_permit_guid': 'The GUID of the Explosives Permit to get.'
        })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(EXPLOSIVES_PERMIT_MODEL, code=200)
    def get(self, mine_guid, explosives_permit_guid):
        explosives_permit = ExplosivesPermit.find_by_explosives_permit_guid(explosives_permit_guid)
        if explosives_permit is None:
            raise NotFound('Explosives Permit not found')

        return explosives_permit

    @api.doc(
        description='Update an Explosives Permit.',
        params={
            'mine_guid': 'The GUID of the mine the Explosives Permit belongs to.',
            'explosives_permit_guid': 'The GUID of the Explosives Permit to update.'
        })
    @requires_any_of([MINE_EDIT])
    @api.marshal_with(EXPLOSIVES_PERMIT_MODEL, code=200)
    def put(self, mine_guid, explosives_permit_guid):
        explosives_permit = ExplosivesPermit.find_by_explosives_permit_guid(explosives_permit_guid)
        if explosives_permit is None:
            raise NotFound('Explosives Permit not found')

        data = self.parser.parse_args()
        explosives_permit.update()

        explosives_permit.save()
        return explosives_permit

    @api.doc(
        description='Delete an Explosives Permit.',
        params={
            'mine_guid': 'The GUID of the mine the Explosives Permit belongs to.',
            'explosives_permit_guid': 'The GUID of the Explosives Permit to delete.'
        })
    @requires_any_of([MINE_ADMIN])
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, explosives_permit_guid):
        explosives_permit = ExplosivesPermit.find_by_explosives_permit_guid(explosives_permit_guid)
        if explosives_permit is None:
            raise NotFound('Explosives Permit not found')

        explosives_permit.delete()
        return None, 204
