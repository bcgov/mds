from flask_restx import Resource, marshal
from flask import request
from werkzeug.exceptions import BadRequest

from app.api.mines.response_models import PERMIT_CONDITION_TAG_MODEL
from app.api.utils.access_decorators import requires_role_mine_admin, requires_role_view_all
from app.api.utils.models_mixins import SoftDeleteMixin
from app.extensions import api
from app.api.mines.permits.permit_conditions.models import PermitConditionTag
from app.api.utils.resources_mixins import UserMixin


class PermitConditionTagResource(Resource, UserMixin, SoftDeleteMixin):

    @api.doc(description='Get all permit condition tags')
    @requires_role_view_all
    @api.marshal_with(PERMIT_CONDITION_TAG_MODEL, code=200, envelope='records')
    def get(self):
        return PermitConditionTag.query.filter_by(deleted_ind=False).order_by(PermitConditionTag.description.asc()).all()
    
    @requires_role_mine_admin
    @api.expect(PERMIT_CONDITION_TAG_MODEL)
    #@api.marshal_with(PERMIT_CONDITION_TAG_MODEL, code=204)
    def delete(self, permit_condition_tag_guid):
        tag = PermitConditionTag.find_by_guid(permit_condition_tag_guid)
        if not tag:
            raise BadRequest(f"Permit condition tag with ID {permit_condition_tag_guid} not found.")
        
        tag.deleted_ind = True
        tag.save()
        return {'message': 'Permit condition tag deleted successfully.'}, 204
    
    @requires_role_mine_admin
    @api.marshal_with(PERMIT_CONDITION_TAG_MODEL, code=204)
    def put(self, permit_condition_tag_guid):
        tag = PermitConditionTag.find_by_guid(permit_condition_tag_guid)
        if not tag:
            raise BadRequest(f"Permit condition tag with ID {permit_condition_tag_guid} not found.")
        
        tag.description = request.json.get('description', tag.description)
        tag.save()
        return marshal(tag, PERMIT_CONDITION_TAG_MODEL), 200
    
    @requires_role_mine_admin
    def post(self):

        description = request.json.get('description')
        if not description:
            raise BadRequest("Missing required field to create a permit condition tag.")

        tag = PermitConditionTag(description=description)
        tag.save()
        return marshal(tag, PERMIT_CONDITION_TAG_MODEL), 201