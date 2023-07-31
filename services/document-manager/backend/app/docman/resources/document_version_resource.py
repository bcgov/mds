
from app.docman.models.document_version import DocumentVersion
from app.docman.models.document import Document
from app.docman.response_models import DOCUMENT_VERSION_MODEL
from app.extensions import api
from app.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, GIS
from flask_restx import Resource
from werkzeug.exceptions import BadRequest, NotFound


@api.route(f'/documents/<string:document_guid>/versions/<string:document_version_guid>')
class DocumentVersionResource(Resource):

    @api.doc(description='Returns the document version matching the given guid')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT, GIS])
    @api.marshal_with(DOCUMENT_VERSION_MODEL, code=200)
    def get(self, document_guid, document_version_guid):
        document = Document.find_by_document_guid(document_guid=document_guid)

        if not document:
            raise NotFound('Document not found')

        document_version = DocumentVersion.find_by_id(document_version_guid)
        if not document_version:
            raise NotFound('Document version not found')

        if document_version.document_guid != document.document_guid:
            raise BadRequest(
                'Document version does not belong to the given document')

        return document_version
