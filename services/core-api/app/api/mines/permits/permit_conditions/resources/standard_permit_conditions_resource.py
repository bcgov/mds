from flask_restx import Resource, marshal
from flask import request, current_app
from werkzeug.exceptions import BadRequest
from marshmallow.exceptions import MarshmallowError

from app.extensions import api, db
from app.api.mines.response_models import STANDARD_PERMIT_CONDITION_MODEL
from app.api.mines.permits.permit_conditions.models import StandardPermitConditions
from app.api.utils.access_decorators import requires_role_edit_standard_permit_conditions
from app.api.utils.resources_mixins import UserMixin


class StandardPermitConditionsResource(Resource, UserMixin):
    @api.doc(description='Update a standard permit condition')
    @requires_role_edit_standard_permit_conditions
    @api.expect(STANDARD_PERMIT_CONDITION_MODEL)
    @api.marshal_with(STANDARD_PERMIT_CONDITION_MODEL, code=200)
    def put(self, standard_permit_condition_guid):
        old_display_order = None
        old_condition = StandardPermitConditions.find_by_standard_permit_condition_guid(
            standard_permit_condition_guid)

        if old_condition:
            old_display_order = old_condition.display_order

        try:
            condition = StandardPermitConditions._schema().load(
                request.json,
                instance=StandardPermitConditions.
                find_by_standard_permit_condition_guid(
                    standard_permit_condition_guid))
        except MarshmallowError as e:
            raise BadRequest(e)

        conditions = []
        if condition.parent_standard_permit_condition_id is not None:
            conditions = condition.parent.sub_conditions
        else:
            conditions = [
                x for x in StandardPermitConditions.
                find_by_notice_of_work_type_code(condition.notice_of_work_type)
                if x.condition_category_code ==
                condition.condition_category_code
            ]

        if conditions and old_display_order:
            if condition.display_order > old_display_order:
                conditions = sorted(
                    conditions,
                    key=lambda x:
                    (x.display_order, x.standard_permit_condition_guid ==
                     condition.standard_permit_condition_guid))
            else:
                conditions = sorted(
                    conditions,
                    key=lambda x:
                    (x.display_order, x.standard_permit_condition_guid !=
                     condition.standard_permit_condition_guid))

            for i, cond in enumerate(conditions):
                cond.display_order = i + 1
                cond.save(commit=False)

        db.session.commit()
        return condition

    @api.doc(description='Delete a standard permit condition')
    @requires_role_edit_standard_permit_conditions
    @api.expect(STANDARD_PERMIT_CONDITION_MODEL)
    @api.marshal_with(STANDARD_PERMIT_CONDITION_MODEL, code=204)
    def delete(self, standard_permit_condition_guid):
        standard_permit_condition = StandardPermitConditions.find_by_standard_permit_condition_guid(
            standard_permit_condition_guid)

        if not standard_permit_condition:
            raise BadRequest(
                'No standard permit condition found with that guid.')

        standard_permit_condition.deleted_ind = True
        standard_permit_condition.save()

        conditions = []
        if standard_permit_condition.parent_standard_permit_condition_id is not None:
            conditions = standard_permit_condition.parent.sub_conditions
        else:
            conditions = [
                x for x in
                StandardPermitConditions.find_by_notice_of_work_type_code(
                    standard_permit_condition.notice_of_work_type)
                if x.condition_category_code ==
                standard_permit_condition.condition_category_code
            ]

        if conditions:
            for i, condition in enumerate(
                    sorted(conditions, key=lambda x: x.display_order)):
                condition.display_order = i + 1
                condition.save(commit=False)

        db.session.commit()

        return (' ', 204)
