from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, EDIT_VARIANCE, MINESPACE_PROPONENT

from app.api.utils.resources_mixins import UserMixin
from app.api.services.traction_service import TractionService

class VerifiableCredentialConnectionResource(Resource, UserMixin):
    @api.doc(description='Create a connection invitation for a mine by guid', params={})
    def post(self,mine_guid):
        traction_svc=TractionService()
        traction_svc.create_oob_connection_invitation(mine_guid)
        return {}
