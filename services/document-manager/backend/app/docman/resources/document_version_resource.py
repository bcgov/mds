
from app.config import Config
from app.docman.models.document_version import DocumentVersion
from app.docman.models.document import Document
from app.docman.response_models import DOCUMENT_VERSION_MODEL
from app.docman.utils.document_upload_helper import DocumentUploadHelper
from app.extensions import api, db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, GIS, DOCUMENT_UPLOAD_ROLES
from app.utils.include.user_info import User
from flask_restx import Resource
from werkzeug.exceptions import BadRequest, Forbidden, NotFound


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

    @api.doc(
        description='Commits an uploaded replacement file that currently exists in the temporary s3 folder. ' \
        'Called when the user confirms the document replacement.')
    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    @api.marshal_with(DOCUMENT_VERSION_MODEL, code=200)
    def post(self, document_guid, document_version_guid):
        document, document_version = self._find_own_document_version(document_guid, document_version_guid)

        if document_version.upload_completed_date is not None:
            return document_version

        temp_key = DocumentUploadHelper.version_temp_key(document.document_guid, document_version.id)
        if not ObjectStoreStorageService().file_exists(temp_key):
            raise BadRequest('The replacement file could not be found. It may not have finished uploading, '
                             'or the upload may have expired. Please upload the file again.')

        new_file_display_name = document_version.file_display_name

        key_prefix = Config.S3_PREFIX[:-1] if Config.S3_PREFIX and Config.S3_PREFIX != '/' else ''
        DocumentUploadHelper.complete_upload(
            key=temp_key,
            new_key=f'{key_prefix}{document.full_storage_path}',
            doc_guid=str(document.document_guid),
            versions=None,
            version_guid=str(document_version.id),
            info_key=None,
            update_doc_status_on_error=False,
            new_file_display_name=new_file_display_name,
        )

        return DocumentVersion.find_by_id(document_version_guid)

    @api.doc(
        description='Discards an uploaded replacement file that has not been committed, '
        'e.g. when the user cancels the replacement. The document is not changed.')
    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def delete(self, document_guid, document_version_guid):
        document, document_version = self._find_own_document_version(document_guid, document_version_guid)

        if document_version.upload_completed_date is not None:
            raise BadRequest('Document version has already been committed and cannot be discarded')

        # Soft delete the temporary upload file in the object store
        ObjectStoreStorageService().delete_file(
            DocumentUploadHelper.version_temp_key(document.document_guid, document_version.id))

        # Remove the version record of the discarded replacement, so these don't pile up. Nothing references
        # uncommitted versions, and a late complete-upload or commit for it now gets a 404.
        db.session.delete(document_version)
        db.session.commit()

        return '', 204

    @staticmethod
    def _find_own_document_version(document_guid, document_version_guid):
        document = Document.find_by_document_guid(document_guid=document_guid)
        if not document:
            raise NotFound('Document not found')

        document_version = DocumentVersion.find_by_id(document_version_guid)
        if not document_version:
            raise NotFound('Document version not found')

        if document_version.document_guid != document.document_guid:
            raise BadRequest('Document version does not belong to the given document')

        if document_version.created_by != User().get_user_username():
            raise Forbidden('Cannot change a document version you did not upload')

        return document, document_version
