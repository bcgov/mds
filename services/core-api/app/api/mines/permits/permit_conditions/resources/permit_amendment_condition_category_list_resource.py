
import uuid

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from app.api.mines.response_models import PERMIT_CONDITION_CATEGORY_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import request
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest

from .permit_amendment_condition_category_resource_base import (
    validate_permit_amendment_category,
)


class PermitAmendmentConditionCategoryListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('step', type=str, required=True, help='Step number is required')
    parser.add_argument('description', type=str, required=True, help='Description is required')
    parser.add_argument('display_order', type=int, required=True, help='Display order is required')


    @requires_role_view_all
    @api.doc(description='Get a list of permit condition categories for the given permit amendment')
    @api.marshal_with(PERMIT_CONDITION_CATEGORY_MODEL, code=200, envelope='records')
    def get(self, mine_guid, permit_guid, permit_amendment_guid):
        mine, permit, permit_amendment, category = validate_permit_amendment_category(mine_guid, permit_guid, permit_amendment_guid)
        
        categories = PermitConditionCategory.find_by_permit_amendment_id(permit_amendment.permit_amendment_id)
        return categories

    @requires_role_view_all
    @api.doc(description='Creates a new permit condition category for the given permit amendment')
    @api.marshal_with(PERMIT_CONDITION_CATEGORY_MODEL, code=201)
    @requires_role_view_all
    def post(self, mine_guid, permit_guid, permit_amendment_guid):
        mine, permit, permit_amendment, category = validate_permit_amendment_category(mine_guid, permit_guid, permit_amendment_guid)

        data = self.parser.parse_args()
        
        existing_category = PermitConditionCategory.find_by_permit_amendment_id_and_description(
            permit_amendment.permit_amendment_id, description=data['description']
        )

        if existing_category:
            return existing_category, 201

        condition_category_code = uuid.uuid4()

        permit_condition_category = PermitConditionCategory.create(
            permit_amendment_id=permit_amendment.permit_amendment_id,
            condition_category_code=condition_category_code,
            step=data['step'],
            description=data['description'],
            display_order=data['display_order'],
        )
        return permit_condition_category, 201
