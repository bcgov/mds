from flask import request
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, ServiceUnavailable

from app.extensions import api
from app.api.utils.access_decorators import requires_role_edit_permit
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.api.mines.documents.dto import CREATE_DOCUMENT_VERSION
from app.api.mines.documents.models.mine_document_version import MineDocumentVersion
from app.api.mines.response_models import MINE_DOCUMENT_VERSION_MODEL
from app.api.services.document_manager_service import DocumentManagerService
from app.api.now_applications.now_document_file_management import get_now_document_for_file_management, check_can_replace


class NOWApplicationDocumentVersionUploadResource(Resource, UserMixin):
    @api.doc(
        description='Request a document_manager_version_guid for uploading a replacement file for a Notice of Work document',
        params={
            'application_guid': 'The GUID of the Notice of Work application the document belongs to',
            'mine_document_guid': 'The GUID of the MineDocument to upload a new version for'
        })
    @api.response(200, 'Successfully requested new document manager version')
    @requires_role_edit_permit
    def post(self, application_guid, mine_document_guid):
        if not is_feature_enabled(Feature.NOW_FILE_MANAGEMENT):
            raise ServiceUnavailable()

        now_application_identity, mine_document, xref = get_now_document_for_file_management(
            application_guid, mine_document_guid)

        # Checked here as well as when the version is recorded: Document Manager makes the uploaded file current as soon as the upload finishes.
        new_filename = DocumentManagerService._parse_request_metadata(request).get('filename')
        if not new_filename:
            raise BadRequest('Upload-Metadata must include the filename of the replacement file.')
        check_can_replace(now_application_identity, mine_document, xref, new_filename=new_filename)

        return DocumentManagerService.initializeFileVersionUploadWithDocumentManager(request, mine_document)


class NOWApplicationDocumentVersionListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'document_manager_version_guid',
        type=str,
        location='json',
        required=True,
        help='GUID of the document manager version to create a new MineDocumentVersion for')

    @api.doc(
        description='Records a replacement file for a Notice of Work document, keeping the previous file as a version',
        params={
            'application_guid': 'The GUID of the Notice of Work application the document belongs to',
            'mine_document_guid': 'The GUID of the MineDocument to create a new version for'
        })
    @api.expect(CREATE_DOCUMENT_VERSION)
    @api.marshal_with(MINE_DOCUMENT_VERSION_MODEL)
    @api.response(200, 'Successfully created new document version')
    @requires_role_edit_permit
    def post(self, application_guid, mine_document_guid):
        if not is_feature_enabled(Feature.NOW_FILE_MANAGEMENT):
            raise ServiceUnavailable()

        now_application_identity, mine_document, xref = get_now_document_for_file_management(
            application_guid, mine_document_guid)
        check_can_replace(now_application_identity, mine_document, xref)

        args = self.parser.parse_args()

        # Updates the existing mine_document in place, so the xref row (and the now_application_document_xref_guid that permit conditions reference) is left untouched.
        return MineDocumentVersion.create_from_docman_version(
            mine_document=mine_document,
            document_manager_version_guid=args.get('document_manager_version_guid'),
        )
