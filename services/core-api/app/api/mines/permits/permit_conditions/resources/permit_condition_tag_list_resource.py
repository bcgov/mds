from flask_restx import Resource, marshal
from flask import request
from werkzeug.exceptions import BadRequest

from app.api.mines.response_models import PERMIT_CONDITION_TAG_MODEL
from app.api.utils.access_decorators import requires_role_mine_admin, requires_role_view_all
from app.extensions import api
from app.api.mines.permits.permit_conditions.models import PermitConditionTag
from app.api.utils.resources_mixins import UserMixin


class PermitConditionTagListResource(Resource, UserMixin):

    @api.doc(description='Get all permit condition tags')
    @requires_role_view_all
    @api.marshal_with(PERMIT_CONDITION_TAG_MODEL, code=200, envelope='records')
    def get(self):
        return PermitConditionTag.get_all()
    
    @requires_role_mine_admin
    def delete_tag(self, tag_guid):
        tag = PermitConditionTag.find_by_guid(tag_guid)
        if not tag:
            raise BadRequest(f"Permit condition tag with ID {tag_guid} not found.")
        
        tag.delete()
        return {'message': 'Permit condition tag deleted successfully.'}, 204
    
    @requires_role_mine_admin
    def create_tag(self, tag_description):
        tag = PermitConditionTag(description=tag_description)
        tag.save()
        return marshal(tag, PERMIT_CONDITION_TAG_MODEL), 201