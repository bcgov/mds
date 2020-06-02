from flask_restplus import Resource, marshal
from flask import request
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
from marshmallow.exceptions import MarshmallowError

from app.extensions import api, jwt
from app.api.securities.response_models import BOND, BOND_MINESPACE
from app.api.securities.models.bond import Bond
from app.api.utils.access_decorators import MINESPACE_PROPONENT, VIEW_ALL, requires_any_of, requires_role_view_all, requires_role_edit_securities
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.mine.models.mine import Mine


class BondListResource(Resource, UserMixin):
    @api.doc(description='Get all bonds on a mine')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(BOND, envelope='records', code=200)
    def get(self):

        mine_guid = request.args.get('mine_guid', None)

        if mine_guid is None:
            raise BadRequest('Please provide a mine_guid.')

        mine = Mine.find_by_mine_guid(mine_guid)

        if mine is None:
            return []

        permits = Permit.find_by_mine_guid(mine.mine_guid)

        if not permits:
            return []

        bonds = [bond for permit in permits for bond in permit.bonds]

        if jwt.validate_roles([MINESPACE_PROPONENT]):
            bonds = marshal(bonds, BOND_MINESPACE)

        return bonds

    @api.doc(description='Create a bond')
    @requires_role_edit_securities
    @api.expect(BOND)
    @api.marshal_with(BOND, code=201)
    def post(self):

        try:
            bond = Bond._schema().load(request.json['bond'])
        except MarshmallowError as e:
            raise BadRequest(e)

        permit = Permit.find_by_permit_guid(request.json['permit_guid'])

        if permit is None:
            raise BadRequest('No permit was found with the guid provided.')

        bond.permit = permit

        for doc in bond.documents:
            doc.mine_guid = permit.mine_guid

        bond.save()

        return bond, 201


class BondResource(Resource, UserMixin):
    @api.doc(description='Get a bond')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(BOND, code=200)
    def get(self, bond_guid):

        bond = Bond.find_by_bond_guid(bond_guid)

        if bond is None:
            raise NotFound('No bond was found with the guid provided.')

        if jwt.validate_roles([MINESPACE_PROPONENT]):
            bond = marshal(bond, BOND_MINESPACE)

        return bond

    @api.doc(description='Update a bond')
    @requires_role_edit_securities
    @api.expect(BOND)
    @api.marshal_with(BOND, code=200)
    def put(self, bond_guid):
        #remove the amount from the request if it exists as it should not be editable.
        temp_bond = Bond.find_by_bond_guid(bond_guid)
        request.json['amount'] = temp_bond.amount

        try:
            bond = Bond._schema().load(request.json, instance=Bond.find_by_bond_guid(bond_guid))
        except MarshmallowError as e:
            raise BadRequest(e)

        for doc in bond.documents:
            doc.mine_guid = bond.permit.mine_guid

        bond.save()

        return bond


class BondTransferResource(Resource, UserMixin):
    @api.doc(description='Transfer a bond to a different permit')
    @requires_role_edit_securities
    @api.marshal_with(BOND, code=200)
    def put(self, bond_guid):
        # Get the bond and validate that it can be transferred
        bond = Bond.find_by_bond_guid(bond_guid)
        if bond is None:
            raise NotFound('No bond was found with the guid provided.')
        if bond.bond_status_code != "ACT":
            raise BadRequest('Only active bonds can be transferred.')

        # Get the permit to transfer the bond to and validate it
        permit_guid = request.json.get('permit_guid', None)
        if not permit_guid:
            raise BadRequest('permit_guid is required.')
        permit = Permit.find_by_permit_guid(permit_guid)
        if not permit:
            raise BadRequest('No permit was found with the permit_guid provided.')
        if permit.permit_guid == bond.permit.permit_guid:
            raise BadRequest('This bond is already associated with this permit.')
        if bond.permit.mine_guid != permit.mine_guid:
            raise BadRequest('You can only transfer to a permit on the same mine.')

        # Get the note to apply to the bond and the transferred bond
        note = request.json.get('note', None)
        if note:
            bond.note = note

        # Release the bond
        bond.bond_status_code = "REL"

        # Create the new "transferred bond"
        new_bond_json = marshal(bond, BOND)
        del new_bond_json['bond_id']
        del new_bond_json['bond_guid']
        del new_bond_json['permit_guid']
        del new_bond_json['permit_no']
        del new_bond_json['payer']
        new_bond_json['bond_status_code'] = 'ACT'
        new_bond_json['note'] = note
        try:
            new_bond = Bond._schema().load(new_bond_json)
        except MarshmallowError as e:
            raise InternalServerError(e)

        permit.bonds.append(new_bond)
        bond.save()
        new_bond.save()

        return new_bond