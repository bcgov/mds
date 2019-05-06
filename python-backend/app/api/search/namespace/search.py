from flask_restplus import Namespace

from ..search.resources.search import SearchResource, SearchOptionsResource

api = Namespace('search', description='Search related operations')

api.add_resource(SearchResource, '')
api.add_resource(SearchOptionsResource, '/options')

#api.add_resource(PermitStatusCodeResource, '/status-codes')
#api.add_resource(PermitAmendmentResource, '/<string:permit_guid>/amendments',
#                 '/amendments/<string:permit_amendment_guid>',
#                 '/<string:permit_guid>/amendments/<string:permit_amendment_guid>')

#api.add_resource(
#    PermitAmendmentDocumentResource,
#    '/amendments/documents',
#    '/amendments/documents/<string:document_guid>',
#    '/amendments/<string:permit_amendment_guid>/documents',
#    '/amendments/<string:permit_amendment_guid>/documents/<string:document_guid>',
#    '/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents/<string:document_guid>',
#    '/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents',
#)
