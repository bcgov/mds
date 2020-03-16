from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import current_app, request
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
from marshmallow.exceptions import MarshmallowError

from app.extensions import api, db
from app.api.securities.response_models import BOND
from app.api.securities.models.bond import Bond
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.permits.permit.models.permit import Permit


class BondListResource(Resource, UserMixin):
    @requires_role_view_all
    @api.marshal_with(BOND, envelope='records', code=200)
    def get(self):

        mine_guid = request.args.get('mine_guid', None)

        if mine_guid is None:
            raise BadRequest('Please provide a mine_guid.')

        permits = Permit.find_by_mine_guid(mine_guid)

        if permits is None:
            return

        bonds = [bond for bond in permit.bonds for permit in permits]

        return bonds

    @api.doc(description='create an bond')
    @requires_role_edit_permit
    @api.expect(BOND)
    @api.marshal_with(BOND, code=201)
    def post(self):

        current_app.logger.debug('Attempting to load bond')
        try:
            bond = Bond._schema().load(request.json)
        except MarshmallowError as e:
            raise BadRequest(e)

        return bond, 201


class BondResource(Resource, UserMixin):
    @requires_role_view_all
    @api.marshal_with(BOND, code=200)
    def get(self, bond_guid):

        bond = Bond.find_by_bond_guid(bond_guid)

        if bond is None:
            raise BadRequest('No bond was found with the guid provided.')

        return bond