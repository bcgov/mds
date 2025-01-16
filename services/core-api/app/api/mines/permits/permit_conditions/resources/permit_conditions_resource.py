from flask_restx import Resource, marshal
from flask import request, current_app
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
from marshmallow.exceptions import MarshmallowError
from datetime import datetime, timezone

from app.extensions import api, jwt, db
from app.api.mines.response_models import PERMIT_CONDITION_MODEL
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.utils.access_decorators import MINESPACE_PROPONENT, VIEW_ALL, requires_role_edit_permit, requires_any_of
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.mine.models.mine import Mine
from app.api.utils.include.user_info import User


class PermitConditionsListResource(Resource, UserMixin):
    @api.doc(description='Create a permit condition on the specified permit draft')
    @requires_role_edit_permit
    @api.expect(PERMIT_CONDITION_MODEL)
    @api.marshal_with(PERMIT_CONDITION_MODEL, code=201)
    def post(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = get_permit_amendment(permit_amendment_guid)

        if permit_amendment.is_generated_in_core and permit_amendment.permit_amendment_status_code != "DFT":
            raise BadRequest('Permit Conditions cannot be edited if the permit was issued in Core and is no longer a draft.')

        request.json['permit_condition'][
            'permit_amendment_id'] = permit_amendment.permit_amendment_id

        try:
            permit_condition = PermitConditions._schema().load(request.json['permit_condition'])

            if permit_condition.top_level_parent_permit_condition_id is not None:
                top_condition = PermitConditions.find_by_permit_condition_id(permit_condition.top_level_parent_permit_condition_id)
                top_condition.permit_condition_status_code = 'NST'

        except MarshmallowError as e:
            raise BadRequest(e)

        permit_condition.save()

        set_audit_metadata(permit_amendment)

        return permit_condition, 201

    @api.doc(description='Get all permit conditions for a specific amendment')
    @requires_role_edit_permit
    @api.marshal_with(PERMIT_CONDITION_MODEL, code=200, envelope='records')
    def get(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)

        if not permit_amendment:
            raise BadRequest('No permit amendment found with that guid.')

        conditions = PermitConditions.find_all_by_permit_amendment_id(
            permit_amendment.permit_amendment_id)

        return conditions


class PermitConditionsResource(Resource, UserMixin):
    @api.doc(description='Get a permit condition')
    @requires_role_edit_permit
    @api.marshal_with(PERMIT_CONDITION_MODEL, code=200)
    def get(self, mine_guid, permit_guid, permit_amendment_guid, permit_condition_guid):
        permit_condition = PermitConditions.find_by_permit_condition_guid(permit_condition_guid)

        if not permit_condition:
            raise BadRequest('No permit condition found with that guid.')

        return permit_condition

    @api.doc(description='Update a permit condition')
    @requires_role_edit_permit
    @api.expect(PERMIT_CONDITION_MODEL)
    @api.marshal_with(PERMIT_CONDITION_MODEL, code=200)
    def put(self, mine_guid, permit_guid, permit_amendment_guid, permit_condition_guid):

        request_data = request.json
        permit_amendment = get_permit_amendment(permit_amendment_guid)

        if permit_amendment.is_generated_in_core and permit_amendment.permit_amendment_status_code != "DFT":
            raise BadRequest('Permit Conditions cannot be edited if the permit was issued in Core and is no longer a draft.')

        old_condition = PermitConditions.find_by_permit_condition_guid(permit_condition_guid)
        old_display_order = old_condition.display_order
        old_category_code = old_condition.condition_category_code
        new_category_code = request_data.get("condition_category_code", None)
        changed_category = old_category_code != new_category_code
        new_status_code = request_data.get("permit_condition_status_code",None)
        changed_status = old_condition.permit_condition_status_code != new_status_code

        if changed_category:
            sub_conditions = old_condition.sub_conditions
            for sub_c in sub_conditions:
                sub_c.condition_category_code = new_category_code

        try:
            condition = PermitConditions._schema().load(
                request_data,
                instance=PermitConditions.find_by_permit_condition_guid(permit_condition_guid))
        except MarshmallowError as e:
            raise BadRequest(e)

        if condition.parent_permit_condition_id is not None:
            conditions = condition.parent.sub_conditions
        else:
            conditions = [
                x for x in PermitConditions.find_all_by_permit_amendment_id(
                    condition.permit_amendment_id)
                if x.condition_category_code == condition.condition_category_code
            ]
        if changed_category:
            condition.display_order = len(conditions) + 1

         #Reset status unless status is being changed to complete
        if not ( changed_status and new_status_code == 'COM' ):
            if condition.top_level_parent_permit_condition_id is not None:
                top_condition = PermitConditions.find_by_permit_condition_id(condition.top_level_parent_permit_condition_id)
                top_condition.permit_condition_status_code = 'NST'
            else:
                condition.permit_condition_status_code = 'NST'

        if condition.display_order > old_display_order:
            conditions = sorted(
                conditions,
                key=lambda x:
                (x.display_order, x.permit_condition_guid == condition.permit_condition_guid))
        else:
            conditions = sorted(
                conditions,
                key=lambda x:
                (x.display_order, x.permit_condition_guid != condition.permit_condition_guid))

        for i, cond in enumerate(conditions):
            cond.display_order = i + 1
            cond.save(commit=False)

        set_audit_metadata(permit_amendment, False)

        db.session.commit()
        return condition

    @api.doc(description='delete a permit condition')
    @requires_role_edit_permit
    @api.expect(PERMIT_CONDITION_MODEL)
    @api.marshal_with(PERMIT_CONDITION_MODEL, code=204)
    def delete(self, mine_guid, permit_guid, permit_amendment_guid, permit_condition_guid):

        permit_amendment = get_permit_amendment(permit_amendment_guid)

        if permit_amendment.is_generated_in_core and permit_amendment.permit_amendment_status_code != "DFT":
            raise BadRequest('Permit Conditions cannot be edited if the permit was issued in Core and is no longer a draft.')
            
        permit_condition = PermitConditions.find_by_permit_condition_guid(permit_condition_guid)

        if not permit_condition:
            raise BadRequest('No permit condition found with that guid.')

        permit_condition.deleted_ind = True
        permit_condition.save()

        conditions = []
        if permit_condition.parent_permit_condition_id is not None:
            conditions = permit_condition.parent.sub_conditions
        else:
            conditions = [
                x for x in PermitConditions.find_all_by_permit_amendment_id(
                    permit_condition.permit_amendment_id)
                if x.condition_category_code == permit_condition.condition_category_code
            ]

        for i, condition in enumerate(sorted(conditions, key=lambda x: x.display_order)):
            condition.display_order = i + 1
            condition.save(commit=False)

        set_audit_metadata(permit_amendment, False)
        db.session.commit()

        return ('', 204)


def get_permit_amendment(permit_amendment_guid):
    permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)

    if not permit_amendment:
        raise BadRequest('No permit amendment found with that guid.')

    return permit_amendment


def set_audit_metadata(permit_amendment, commit=True):
    permit_amendment.permit_conditions_last_updated_by = User().get_user_username()
    permit_amendment.permit_conditions_last_updated_date = datetime.now(timezone.utc)
    permit_amendment.save(commit=commit)
