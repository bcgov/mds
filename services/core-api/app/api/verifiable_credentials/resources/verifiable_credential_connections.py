from flask import current_app
from flask_restplus import Resource
from werkzeug.exceptions import NotFound
from app.extensions import api

from app.api.mines.mine.models.mine import Mine
from app.api.services.traction_service import TractionService

from app.api.utils.resources_mixins import UserMixin

class VerifiableCredentialConnectionResource(Resource, UserMixin):
    @api.doc(description='Create a connection invitation for a mine by guid', params={})
    def post(self, mine_guid: str):
        #mine_guid will be param. just easy this way for development
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound(f"mine not found with mine_guid {mine_guid}")
        
        traction_svc=TractionService()
        invitation = traction_svc.create_oob_connection_invitation(mine_guid, mine.mine_name)
        
        current_app.logger.warn(invitation)
        return invitation
 