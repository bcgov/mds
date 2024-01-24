from flask_restx import Namespace

from app.api.securities.resources.bond import BondListResource, BondResource, BondTransferResource
from app.api.securities.resources.bond_status import BondStatusResource
from app.api.securities.resources.bond_type import BondTypeResource
from app.api.securities.resources.bond_document import BondDocumentListResource

from app.api.securities.resources.reclamation_invoice import ReclamationInvoiceListResource, ReclamationInvoiceResource
from app.api.securities.resources.reclamation_invoice_document import ReclamationInvoiceDocumentListResource

api = Namespace('securities', description='Securities operations')

# Bonds
api.add_resource(BondListResource, '/bonds')
api.add_resource(BondResource, '/bonds/<bond_guid>')
api.add_resource(BondTransferResource, '/bonds/<bond_guid>/transfer')
api.add_resource(BondStatusResource, '/bonds/status-codes')
api.add_resource(BondTypeResource, '/bonds/type-codes')
api.add_resource(BondDocumentListResource, '/<string:mine_guid>/bonds/documents')

# Reclamation Invoices
api.add_resource(ReclamationInvoiceListResource, '/reclamation-invoices')
api.add_resource(ReclamationInvoiceResource, '/reclamation-invoices/<reclamation_invoice_guid>')
api.add_resource(ReclamationInvoiceDocumentListResource,
                 '/<string:mine_guid>/reclamation-invoices/documents')
