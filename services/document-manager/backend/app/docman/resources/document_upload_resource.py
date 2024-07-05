
from app.docman.utils.document_upload_helper import DocumentUploadHelper
from app.constants import TIMEOUT_24_HOURS
from app.docman.models.document import Document
from app.extensions import api
from app.utils.access_decorators import requires_any_of, DOCUMENT_UPLOAD_ROLES
from app.docman.models.document_upload_status import DocumentUploadStatus
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, Forbidden, NotFound
from app.utils.include.user_info import User
from app.docman.models.document_version import DocumentVersion

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

        is_bundle = data.get('is_bundle', False)

        if not document:
            raise NotFound('Document not found')

        if document.status == str(DocumentUploadStatus.SUCCESS) and not data.get('version_guid'):
            raise BadRequest('Forbidden, Document upload has already been completed.')
        
        if document.create_user != User().get_user_username() and not data.get('version_guid'):
            raise Forbidden("Cannot complete upload of file you did not upload")

        version = None
        if data.get('version_guid'):
            version = DocumentVersion.query.filter_by(
                id=data.get('version_guid'),
                document_guid=document_guid).one_or_none()

            if not version:
                raise NotFound('Document version not found')
            
            if version.upload_completed_date is not None:
                raise BadRequest('Forbidden, Document upload has already been completed.')

            print(version.created_by, User().get_user_username())

            if version.created_by != User().get_user_username():
                raise Forbidden("Cannot complete upload of file you did not upload")
            
            if str(version.document_guid) != document_guid:
                raise BadRequest('Document guid does not match version guid')

        return DocumentUploadHelper().complete_multipart_upload(
            upload_id=data['upload_id'],
            parts=data['parts'],
            document=document,
            version=version,
            is_bundle=is_bundle
        )

@api.route(f'/documents/complete-bundle')
class DocumentBundleUploadResource(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'bundle_document_guids', type=list, required=True, help='List of document guids that should be bundled.', location='json',
    )
    parser.add_argument('name', type=str, required=True, help='Name of bundle.', location='json')

    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def patch(self):
        data = self.parser.parse_args()
        bundle_document_guids = data.get('bundle_document_guids')
        name = data.get('name')

        if not name:
            raise BadRequest('Name not provided')

        if not bundle_document_guids:
            raise BadRequest('No documents provided to bundle')

        return DocumentUploadHelper().complete_bundle_upload(bundle_document_guids, name)
