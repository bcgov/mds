from datetime import datetime, timezone

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.response_models import (
    PERMIT_CONDITION_MODEL,
    PERMIT_CONDITION_SEARCH_MODEL,
    PERMIT_CONDITION_SEARCH_RESULT_MODEL,
)
from app.api.search.search.permit_search_service import PermitSearchService
from app.api.utils.access_decorators import (
    MINESPACE_PROPONENT,
    VIEW_ALL,
    requires_any_of,
    requires_role_edit_permit,
)
from app.api.utils.include.user_info import User
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api, db, jwt
from flask import current_app, request
from flask_restx import Resource, marshal
from marshmallow.exceptions import MarshmallowError
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound


class PermitConditionsSearchResource(Resource, UserMixin):
    @api.doc(description='Search Permit Conditions using the permit service')
    @requires_role_edit_permit
    @api.expect(PERMIT_CONDITION_SEARCH_MODEL)
    @api.marshal_with(PERMIT_CONDITION_SEARCH_RESULT_MODEL)
    def post(self):
        request_data = request.json

        results = PermitSearchService().search(request_data)

        print(results)

        return results