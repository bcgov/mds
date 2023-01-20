from flask_restplus import Resource, marshal
from flask import request
from werkzeug.exceptions import BadRequest, NotFound
from marshmallow.exceptions import MarshmallowError

from app.extensions import api
from app.api.mines.response_models import STANDARD_PERMIT_CONDITION_MODEL
from app.api.mines.permits.permit_conditions.models import StandardPermitConditions
from app.api.utils.access_decorators import requires_role_edit_standard_permit_conditions
from app.api.utils.resources_mixins import UserMixin


class StandardPermitConditionsListResource(Resource, UserMixin):
    @api.doc(description='Get all standard permit conditions for a notice of work type')
    @requires_role_edit_standard_permit_conditions
    @api.marshal_with(STANDARD_PERMIT_CONDITION_MODEL, code=200, envelope='records')
    def get(self, notice_of_work_type):
        standard_permit_condition = StandardPermitConditions.find_by_notice_of_work_type_code(
            notice_of_work_type)
        if not standard_permit_condition:
            raise NotFound(
                'No standard permit conditions found with that notice of work type code.')

        return standard_permit_condition

    @api.doc(description='Create a standard permit condition')
    @requires_role_edit_standard_permit_conditions
    @api.expect(STANDARD_PERMIT_CONDITION_MODEL)
    @api.marshal_with(STANDARD_PERMIT_CONDITION_MODEL, code=201)
    def post(self, notice_of_work_type):
        try:
            standard_permit_condition = StandardPermitConditions._schema().load(
                request.json['standard_permit_condition'])
        except MarshmallowError as e:
            raise BadRequest(e)

        standard_permit_condition.save()

        return standard_permit_condition, 201
