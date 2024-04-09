from flask_restx import Resource, reqparse
from datetime import datetime
from flask import current_app, request

from app.api.mines.permits.permit_conditions.models.permit_condition_category import PermitConditionCategory
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.response_models import PERMIT_CONDITION_CATEGORY_MODEL


class PermitConditionCategoryResource(Resource, UserMixin):
    @requires_role_view_all
    @api.marshal_with(PERMIT_CONDITION_CATEGORY_MODEL, envelope='records', code=200)
    def get(self):
        return PermitConditionCategory.get_all()
