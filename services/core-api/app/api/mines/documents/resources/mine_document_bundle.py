from flask_restx import Resource
from werkzeug.exceptions import NotFound, BadRequest

from app.api.mines.documents.models.mine_document_bundle import (
    VALIDATION_STATUS_INVALID,
    VALIDATION_STATUS_UNABLE_TO_VALIDATE,
    VALIDATION_STATUS_VALID,
    MineDocumentBundle,
)
from app.api.mines.mine.models.mine import Mine
from app.api.mines.response_models import MINE_DOCUMENT_BUNDLE_MODEL
from app.api.utils.access_decorators import (
    VIEW_ALL,
    MINESPACE_PROPONENT,
    EDIT_PERMIT,
    requires_any_of,
)
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.extensions import api

ALLOWED_VALIDATION_STATUSES = {
    VALIDATION_STATUS_VALID,
    VALIDATION_STATUS_INVALID,
    VALIDATION_STATUS_UNABLE_TO_VALIDATE,
}


def _require_mine(mine_guid):
    """Load the mine so UserBoundQuery applies MineSpace participation."""
    mine = Mine.find_by_mine_guid(mine_guid)
    if not mine:
        raise NotFound('Mine not found.')
    return mine


def _assert_documents_belong_to_mine(documents, mine_guid):
    mine_guid_str = str(mine_guid)
    active_documents = [
        doc for doc in (documents or []) if not getattr(doc, 'deleted_ind', False)
    ]
    if not active_documents:
        raise BadRequest('Mine document bundle has no active documents')
    for doc in active_documents:
        if str(doc.mine_guid) != mine_guid_str:
            raise BadRequest('Mine document not attached to Mine')


def _get_bundle_for_mine(mine_guid, mine_document_bundle_id):
    _require_mine(mine_guid)
    mine_document_bundle = MineDocumentBundle.find_by_bundle_id(mine_document_bundle_id)
    if not mine_document_bundle:
        raise NotFound('Mine document bundle not found')
    _assert_documents_belong_to_mine(mine_document_bundle.bundle_documents, mine_guid)
    return mine_document_bundle


class MineDocumentBundleListResource(Resource, UserMixin):
    """Create / upsert a spatial document bundle (used by docman spatial processing)."""

    parser = CustomReqparser()
    parser.add_argument('name', type=str, required=True)
    parser.add_argument('docman_bundle_guid', type=str, required=True)
    parser.add_argument('geomark_id', type=str, required=False)
    parser.add_argument('validation_status', type=str, required=False)
    parser.add_argument('validation_error', type=str, required=False)
    parser.add_argument('validation_checks', type=dict, required=False)
    parser.add_argument('document_manager_guids', type=list, location='json', required=True)
    parser.add_argument('preserve_purposes', type=bool, required=False, default=True)

    @api.doc(description='Create or update a mine document spatial bundle and link documents')
    @api.marshal_with(MINE_DOCUMENT_BUNDLE_MODEL, code=200)
    @requires_any_of([EDIT_PERMIT])
    def post(self, mine_guid):
        _require_mine(mine_guid)
        data = self.parser.parse_args()
        document_manager_guids = data.get('document_manager_guids') or []
        if not document_manager_guids:
            raise BadRequest('document_manager_guids is required')

        validation_status = data.get('validation_status')
        if validation_status and validation_status not in ALLOWED_VALIDATION_STATUSES:
            raise BadRequest(f'Invalid validation_status: {validation_status}')

        bundle = MineDocumentBundle.upsert_from_spatial_result(
            name=data['name'],
            docman_bundle_guid=data.get('docman_bundle_guid'),
            document_manager_guids=document_manager_guids,
            geomark_id=data.get('geomark_id'),
            validation_status=validation_status,
            validation_error=data.get('validation_error'),
            validation_checks=data.get('validation_checks'),
            preserve_purposes=data.get('preserve_purposes', True),
            mine_guid=mine_guid,
        )
        return bundle.json()


class MineDocumentBundleResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('purpose_codes', type=list, location='json', required=True, nullable=False)

    @api.doc(description='Returns a mine document spatial bundle')
    @api.marshal_with(MINE_DOCUMENT_BUNDLE_MODEL, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_guid, mine_document_bundle_id):
        return _get_bundle_for_mine(mine_guid, mine_document_bundle_id).json()

    @api.doc(description='Update spatial bundle purpose flags')
    @api.marshal_with(MINE_DOCUMENT_BUNDLE_MODEL, code=200)
    @requires_any_of([EDIT_PERMIT, MINESPACE_PROPONENT])
    def patch(self, mine_guid, mine_document_bundle_id):
        mine_document_bundle = _get_bundle_for_mine(mine_guid, mine_document_bundle_id)

        data = self.parser.parse_args()
        mine_document_bundle.set_purpose_codes(data['purpose_codes'])
        mine_document_bundle.save()
        return mine_document_bundle.json()
