

from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.response_models import PERMIT_CONDITION_CATEGORY_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest

from .permit_amendment_condition_category_resource_base import (
    validate_permit_amendment_category,
)


class PermitAmendmentConditionCategoryResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('step', type=str, required=True, help='Step number is required')
    parser.add_argument('description', type=str, required=True, help='Description is required')
    parser.add_argument('display_order', type=int, required=True, help='Display order is required')

    @requires_role_view_all
    @api.doc(description='Deletes a permit condition category')
    def delete(self, mine_guid, permit_guid, permit_amendment_guid, permit_condition_category_code):
        mine, permit, permit_amendment, category = validate_permit_amendment_category(
            mine_guid, permit_guid, permit_amendment_guid, permit_condition_category_code)

        conditions = PermitConditions.find_by_condition_category_code(
            permit_condition_category_code)
        
        if len(conditions) > 0:
            raise BadRequest('Cannot delete a category that has conditions associated with it')

        category.delete(commit=True)

        return {'message': 'Permit condition category deleted successfully'}, 204

    @api.doc(description='Creates a new permit condition category for the given permit amendment. Reorders existing categories if display_order has changed.')
    @api.marshal_with(PERMIT_CONDITION_CATEGORY_MODEL, code=201)
    @requires_role_view_all
    def put(self, mine_guid, permit_guid, permit_amendment_guid, permit_condition_category_code):
        data = self.parser.parse_args()

        mine, permit, permit_amendment, existing_category = validate_permit_amendment_category(
            mine_guid, permit_guid, permit_amendment_guid, permit_condition_category_code)

        categories = PermitConditionCategory.find_by_permit_amendment_id(permit_amendment.permit_amendment_id)

        if data['display_order'] > len(categories):
            raise BadRequest('Display order cannot be greater than the number of categories')
        
        if data['display_order'] < 0:
            raise BadRequest('Display order must be >= 0')

        existing_category.step = data['step']
        existing_category.description = data['description']

        # Only reorder if the display order has changed
        if existing_category.display_order != data['display_order']:
            existing_category.display_order = data['display_order']

            categories = sorted(categories, key=lambda x: x.display_order)
            # Remove the current category from the list since it will be repositioned
            categories = [c for c in categories if c.condition_category_code != existing_category.condition_category_code]

            # Insert the category at the new position
            categories.insert(data['display_order'], existing_category)
            
            # Update all display orders to ensure sequential ordering
            for index, category in enumerate(categories):
                category.display_order = index
                category.save()

        existing_category.save()

        return existing_category, 200
