from flask_restx import Resource
from flask import request
from werkzeug.exceptions import BadRequest, NotFound
from marshmallow.exceptions import MarshmallowError

from app.extensions import api
from app.api.securities.response_models import RECLAMATION_INVOICE
from app.api.securities.models.reclamation_invoice import ReclamationInvoice
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_securities
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.mine.models.mine import Mine


class ReclamationInvoiceListResource(Resource, UserMixin):
    @api.doc(description='Get all reclamation invoices on a mine')
    @requires_role_view_all
    @api.marshal_with(RECLAMATION_INVOICE, envelope='records', code=200)
    def get(self):
        mine_guid = request.args.get('mine_guid', None)

        if mine_guid is None:
            raise BadRequest('Please provide a mine_guid.')

        mine = Mine.find_by_mine_guid(mine_guid)

        if mine is None:
            return []

        permits = mine.mine_permit
        if not permits:
            return []

        reclamation_invoices = [
            reclamation_invoice for permit in permits
            for reclamation_invoice in permit.reclamation_invoices
        ]

        return reclamation_invoices

    @api.doc(description='Create a reclamation invoice')
    @requires_role_edit_securities
    @api.expect(RECLAMATION_INVOICE)
    @api.marshal_with(RECLAMATION_INVOICE, code=201)
    def post(self):
        try:
            reclamation_invoice = ReclamationInvoice._schema().load(
                request.json['reclamation_invoice'])
        except MarshmallowError as e:
            raise BadRequest(e)

        permit = Permit.find_by_permit_guid(request.json['permit_guid'])

        if permit is None:
            raise BadRequest('No permit was found with the guid provided.')

        reclamation_invoice.permit = permit
        reclamation_invoice.save()

        return reclamation_invoice, 201


class ReclamationInvoiceResource(Resource, UserMixin):
    @api.doc(description='Get a reclamation invoice')
    @requires_role_view_all
    @api.marshal_with(RECLAMATION_INVOICE, code=200)
    def get(self, reclamation_invoice_guid):
        reclamation_invoice = ReclamationInvoice.find_by_reclamation_invoice_guid(
            reclamation_invoice_guid)

        if reclamation_invoice is None:
            raise NotFound('No reclamation invoice was found with the guid provided.')

        return reclamation_invoice

    @api.doc(description='Update a reclamation invoice')
    @requires_role_edit_securities
    @api.expect(RECLAMATION_INVOICE)
    @api.marshal_with(RECLAMATION_INVOICE, code=200)
    def put(self, reclamation_invoice_guid):
        try:
            reclamation_invoice = ReclamationInvoice._schema().load(
                request.json,
                instance=ReclamationInvoice.find_by_reclamation_invoice_guid(
                    reclamation_invoice_guid))
        except MarshmallowError as e:
            raise BadRequest(e)

        reclamation_invoice.save()

        return reclamation_invoice