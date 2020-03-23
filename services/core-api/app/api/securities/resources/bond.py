from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import current_app, request
from werkzeug.exceptions import BadRequest, NotFound
from marshmallow.exceptions import MarshmallowError

from app.extensions import api, db
from app.api.securities.response_models import BOND
from app.api.securities.models.bond import Bond
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_bonds
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.mine.models.mine import Mine


class BondListResource(Resource, UserMixin):
    @requires_role_view_all
    @api.marshal_with(BOND, envelope='records', code=200)
    def get(self):

        mine_guid = request.args.get('mine_guid', None)

        if mine_guid is None:
            raise BadRequest('Please provide a mine_guid.')

        mine = Mine.find_by_mine_guid(mine_guid)

        if mine is None:
            raise NotFound('No mine found with the provided mine_guid.')

        permits = Permit.find_by_mine_guid(mine.mine_guid)

        if not permits:
            return []

        bonds = [bond for permit in permits for bond in permit.bonds]

        return bonds

    @api.doc(description='create a bond')
    @requires_role_edit_bonds
    @api.expect(BOND)
    @api.marshal_with(BOND, code=201)
    def post(self):

        try:
            bond = Bond._schema().load(request.json['bond'])
        except MarshmallowError as e:
            raise BadRequest(e)

        permit = Permit.find_by_permit_guid(request.json['permit_guid'])

        if permit is None:
            raise NotFound('No Permit found with the guid provided.')

        bond.permits = permit

        bond.save()

        return bond, 201


class BondResource(Resource, UserMixin):
    @requires_role_view_all
    @api.marshal_with(BOND, code=200)
    def get(self, bond_guid):

        bond = Bond.find_by_bond_guid(bond_guid)

        if bond is None:
            raise NotFound('No bond was found with the guid provided.')

        return bond

    @api.doc(description='Update a bond')
    @requires_role_edit_bonds
    @api.expect(BOND)
    @api.marshal_with(BOND, code=200)
    def put(self, bond_guid):

        try:
            bond = Bond._schema().load(request.json, instance=Bond.find_by_bond_guid(bond_guid))
        except MarshmallowError as e:
            raise BadRequest(e)

        bond.save()

        return bond