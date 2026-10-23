from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, ServiceUnavailable

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_edit_permit
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.response_models import ARCHIVE_MINE_DOCUMENT
from app.api.now_applications.now_document_file_management import get_now_document_for_file_management, check_can_archive


class NOWApplicationDocumentArchiveResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_document_guids',
        type=list,
        location='json',
        required=True,
        help='GUIDs of the mine documents to archive')

    @api.doc(
        description='Archives Notice of Work documents. Permit package documents are removed from the permit package first.',
        params={'application_guid': 'The GUID of the Notice of Work application the documents belong to'})
    @api.expect(ARCHIVE_MINE_DOCUMENT)
    @api.response(204, 'Successfully archived documents')
    @requires_role_edit_permit
    def patch(self, application_guid):
        if not is_feature_enabled(Feature.NOW_FILE_MANAGEMENT):
            raise ServiceUnavailable()

        mine_document_guids = list(dict.fromkeys(self.parser.parse_args()['mine_document_guids'] or []))
        if not mine_document_guids:
            raise BadRequest('At least one document is required.')

        documents = [get_now_document_for_file_management(application_guid, guid) for guid in mine_document_guids]

        # Check every document before changing any, so a blocked document leaves nothing archived
        for now_application_identity, mine_document, xref in documents:
            try:
                check_can_archive(now_application_identity, mine_document, xref)
            except BadRequest as e:
                raise BadRequest(f'{mine_document.document_name}: {e.description}')

        for _, _, xref in documents:
            if xref.is_final_package:
                # Same fields the document PUT clears when a file leaves the permit package
                xref.is_final_package = False
                xref.final_package_order = None
                xref.permit_package_document_type_code = None
        MineDocument.mark_as_archived_many(
            [mine_document.mine_document_guid for _, mine_document, _ in documents], commit=False)

        # One commit, so a failure can't leave a file out of the permit package but not archived
        db.session.commit()
        return None, 204
