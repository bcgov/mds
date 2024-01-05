
from app.docman.utils.document_upload_helper import DocumentUploadHelper
from app.constants import TIMEOUT_24_HOURS
from app.docman.models.document import Document
from app.extensions import api
from app.utils.access_decorators import requires_any_of, DOCUMENT_UPLOAD_ROLES
from app.docman.models.document_upload_status import DocumentUploadStatus
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, Forbidden, NotFound
from app.utils.include.user_info import User

CACHE_TIMEOUT = TIMEOUT_24_HOURS


@api.route(f'/documents/<string:document_guid>/complete-upload')
class DocumentUploadResource(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'upload_id', type=str, required=True, help='S3 Multipart upload id that should be completed.', location='json',)
    parser.add_argument(
        'version_guid', type=str, required=False, help='Guid of version of document you are uploading.', location='json',)
    parser.add_argument(
        'parts', type=list, required=True, help='List of multipart upload parts.', location='json',
    )

    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def patch(self, document_guid):
        data = self.parser.parse_args()

        document = Document.query.filter_by(
            document_guid=document_guid).one_or_none()

        if not document:
            raise NotFound('Document not found')

        if document.status == str(DocumentUploadStatus.SUCCESS):
            raise BadRequest('Forbidden, Document upload has already been completed.')
        
        if document.create_user != User().get_user_username():
            raise Forbidden("Cannot complete upload of file you did not upload")
        
        return DocumentUploadHelper().complete_multipart_upload(
            upload_id=data['upload_id'],
            parts=data['parts'],
            document=document,
            version=None
        )
