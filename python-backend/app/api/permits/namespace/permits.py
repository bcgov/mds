from flask_restplus import Namespace

from ..permit.resources.permit import PermitResource, PermitListResource
from ..permit.resources.permit_status_code import PermitStatusCodeResource
from ..permit_amendment.resources.permit_amendment import PermitAmendmentResource, PermitAmendmentListResource
from ..permit_amendment.resources.permit_amendment_document import PermitAmendmentDocumentResource

api = Namespace('permits', description='Permit related operations')

api.add_resource(PermitResource, '/<string:permit_guid>')
api.add_resource(PermitListResource, '')
api.add_resource(PermitStatusCodeResource, '/status-codes')
api.add_resource(PermitAmendmentResource, '/amendments/<string:permit_amendment_guid>',
                 '/<string:permit_guid>/amendments/<string:permit_amendment_guid>')
api.add_resource(PermitAmendmentListResource, '/<string:permit_guid>/amendments')

api.add_resource(
    PermitAmendmentDocumentResource,
    '/amendments/documents',
    '/amendments/documents/<string:document_guid>',
    '/amendments/<string:permit_amendment_guid>/documents',
    '/amendments/<string:permit_amendment_guid>/documents/<string:document_guid>',
    '/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents/<string:document_guid>',
    '/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents',
)
