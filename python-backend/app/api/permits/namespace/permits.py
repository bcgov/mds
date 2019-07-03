from flask_restplus import Namespace

from ..permit.resources.permit import PermitResource, PermitListResource
from ..permit.resources.permit_status_code import PermitStatusCodeResource
from ..permit_amendment.resources.permit_amendment import PermitAmendmentResource, PermitAmendmentListResource
from ..permit_amendment.resources.permit_amendment_document import PermitAmendmentDocumentListResource, PermitAmendmentDocumentResource

api = Namespace('permits', description='Permit related operations')

api.add_resource(PermitResource, '/<string:permit_guid>')
api.add_resource(PermitListResource, '')
api.add_resource(PermitStatusCodeResource, '/status-codes')

api.add_resource(PermitAmendmentListResource, '/<string:permit_guid>/amendments')
api.add_resource(PermitAmendmentResource,
                 '/<string:permit_guid>/amendments/<string:permit_amendment_guid>')

api.add_resource(
    PermitAmendmentDocumentListResource,
    '/amendments/documents',
    '/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents',
)
api.add_resource(
    PermitAmendmentDocumentResource,
    '/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents/<string:permit_amendment_document_guid>',
)
