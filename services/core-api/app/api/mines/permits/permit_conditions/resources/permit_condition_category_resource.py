from datetime import datetime

from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from app.api.mines.response_models import PERMIT_CONDITION_CATEGORY_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import current_app, request
from flask_restx import Resource, reqparse


class PermitConditionCategoryResource(Resource, UserMixin):
    reqparser = reqparse.RequestParser()
    reqparser.add_argument('query', type=str, required=False)
    reqparser.add_argument('exclude', type=str, required=False, action='append')
    reqparser.add_argument('limit', type=int, required=False)

    @requires_role_view_all
    @api.marshal_with(PERMIT_CONDITION_CATEGORY_MODEL, envelope='records', code=200)
    def get(self):
        data = self.reqparser.parse_args()
        return PermitConditionCategory.search(
            query = data['query'],
            exclude = data.get('exclude'),
            limit = data.get('limit') or 7,
        )
