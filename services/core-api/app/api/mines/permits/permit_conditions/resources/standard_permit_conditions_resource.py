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

    
class StandardPermitConditionsResource(Resource, UserMixin):
    @api.doc(description='Get a standard permit condition')
    @requires_role_edit_permit
    @api.marshal_with(STANDARD_PERMIT_CONDITION_MODEL, code=200)
    def get(self, standard_permit_condition_guid):
        standard_permit_condition = StandardPermitConditions.find_by_permit_condition_guid(standard_permit_condition_guid)

        if not standard_permit_condition:
            raise BadRequest('No standard permit condition found with that guid.')

        return standard_permit_condition

    @api.doc(description='Update a standard permit condition')
    @requires_role_edit_permit
    @api.expect(STANDARD_PERMIT_CONDITION_MODEL)
    @api.marshal_with(STANDARD_PERMIT_CONDITION_MODEL, code=200)
    def put(self, standard_permit_condition_guid):
        old_condition = StandardPermitConditions.find_by_standard_permit_condition_guid(standard_permit_condition_guid)
        old_display_order = old_condition.display_order

        try:
            condition = StandardPermitConditions._schema().load(
                request.json,
                instance=StandardPermitConditions.find_by_standard_permit_condition_guid(standard_permit_condition_guid))
        except MarshmallowError as e:
            raise BadRequest(e)

        if condition.parent_standard_permit_condition_id is not None:
            conditions = condition.parent.sub_conditions
        

        if condition.display_order > old_display_order:
            conditions = sorted(
                conditions,
                key=lambda x:
                (x.display_order, x.standard_permit_condition_guid == condition.standard_permit_condition_guid))
        else:
            conditions = sorted(
                conditions,
                key=lambda x:
                (x.display_order, x.standard_permit_condition_guid != condition.standard_permit_condition_guid))

        for i, cond in enumerate(conditions):
            cond.display_order = i + 1
            cond.save(commit=False)


        db.session.commit()
        return condition

 