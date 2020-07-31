from flask_restplus import Resource, marshal
from flask import request, current_app
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
from marshmallow.exceptions import MarshmallowError

from app.extensions import api, jwt
from app.api.mines.response_models import PERMIT_CONDITION_MODEL
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.utils.access_decorators import MINESPACE_PROPONENT, VIEW_ALL, requires_role_edit_permit, requires_any_of
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.mine.models.mine import Mine


class PermitConditionsListResource(Resource, UserMixin):
    @api.doc(description='Create a permit condition on the specified permit draft')
    @requires_role_edit_permit
    @api.expect(PERMIT_CONDITION_MODEL)
    @api.marshal_with(PERMIT_CONDITION_MODEL, code=201)
    def post(self, mine_guid, permit_guid, permit_amendment_guid):

        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)

        if not permit_amendment:
            raise BadRequest('No permit amendment found with that guid.')

        request.json['permit_condition'][
            'permit_amendment_id'] = permit_amendment.permit_amendment_id

        try:
            permit_condition = PermitConditions._schema().load(request.json['permit_condition'])
        except MarshmallowError as e:
            raise BadRequest(e)

        permit_condition.save()

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
        current_app.logger.debug(conditions[0].sub_conditions)

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

        try:
            condition = PermitConditions._schema().load(
                request.json,
                instance=PermitConditions.find_by_permit_condition_guid(permit_condition_guid))
        except MarshmallowError as e:
            raise BadRequest(e)

        condition.save()

        return condition

    @api.doc(description='delete a permit condition')
    @requires_role_edit_permit
    @api.expect(PERMIT_CONDITION_MODEL)
    @api.marshal_with(PERMIT_CONDITION_MODEL, code=204)
    def delete(self, mine_guid, permit_guid, permit_amendment_guid, permit_condition_guid):

        permit_condition = PermitConditions.find_by_permit_condition_guid(permit_condition_guid)

        if not permit_condition:
            raise BadRequest('No permit condition found with that guid.')

        permit_condition.deleted_ind = True

        permit_condition.save()

        return ('', 204)