from flask_restplus import Resource, marshal
from flask import request, current_app
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
from marshmallow.exceptions import MarshmallowError
from datetime import datetime, timezone

from app.extensions import api, jwt, db
from app.api.mines.response_models import STANDARD_PERMIT_CONDITION_MODEL
from app.api.mines.permits.permit_conditions.models import StandardPermitConditions
from app.api.utils.access_decorators import MINESPACE_PROPONENT, VIEW_ALL, requires_role_edit_permit, requires_any_of
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.mine.models.mine import Mine
from app.api.utils.include.user_info import User


class StandardPermitConditionsListResource(Resource, UserMixin):
    @api.doc(description='Create a standard permit condition on the specified permit draft')
    @requires_role_edit_permit
    @api.expect(STANDARD_PERMIT_CONDITION_MODEL)
    @api.marshal_with(STANDARD_PERMIT_CONDITION_MODEL, code=201)
    def post(self, notice_of_work_type_code):
       
        try:
            standard_permit_condition = StandardPermitConditions._schema().load(request.json['standard_permit_condition'])
        except MarshmallowError as e:
            raise BadRequest(e)

        standard_permit_condition.save()

        return standard_permit_condition, 201

    
    @api.doc(description='Get all standard permit conditions for a notice of work type')
    @requires_role_edit_permit
    @api.marshal_with(STANDARD_PERMIT_CONDITION_MODEL, code=200, envelope='records')
    def get(self, notice_of_work_type):
        standard_permit_condition = StandardPermitConditions.find_by_notice_of_work_type_code(notice_of_work_type)
        if not standard_permit_condition:
            raise BadRequest('No standard permit conditions found with that notice of work type code.')

        return standard_permit_condition