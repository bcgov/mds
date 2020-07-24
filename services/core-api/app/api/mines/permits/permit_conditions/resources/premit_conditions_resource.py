from flask_restplus import Resource, marshal
from flask import request
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

        try:
            permit_condition = PermitConditions._schema().load(request.json['permit_condition'])
        except MarshmallowError as e:
            raise BadRequest(e)

        return permit_condition, 201


class PermitConditionsResource(Resource, UserMixin):
    @api.doc(description='Get a bond')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PERMIT_CONDITION_MODEL, code=200)
    def get(self, bond_guid):

        return

    @api.doc(description='Update a bond')
    @requires_role_edit_permit
    @api.expect(PERMIT_CONDITION_MODEL)
    @api.marshal_with(PERMIT_CONDITION_MODEL, code=200)
    def put(self, bond_guid):
        #remove the amount from the request if it exists as it should not be editable.

        return
