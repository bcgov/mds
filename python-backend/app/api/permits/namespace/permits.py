from flask_restplus import Namespace

from ..permit.resources.permit import PermitResource
from ..permit.resources.permit_status_code import PermitStatusCodeResource
from ..permit_amendment.resources.permit_amendment import PermitAmendmentResource
from ..permit_amendment.resources.permit_amendment_document import PermitAmendmentDocumentResource

api = Namespace('permits', description='Permit related operations')

api.add_resource(PermitResource, '', '/<string:permit_guid>')
api.add_resource(PermitStatusCodeResource, '/status-codes')
api.add_resource(PermitAmendmentResource, '/<string:permit_guid>/amendments',
                 '/amendments/<string:permit_amendment_guid>',
                 '/<string:permit_guid>/amendments/<string:permit_amendment_guid>')

api.add_resource(
    PermitAmendmentDocumentResource,
    '/amendments/<string:permit_amendment_guid>/documents',
    '/amendments/<string:permit_amendment_guid>/documents/<string:document_guid>',
    '/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents/<string:document_guid>',
    '/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents',
)
