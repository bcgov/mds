from flask_restx import Resource
from werkzeug.exceptions import NotFound, BadRequest

from app.api.mines.documents.models.mine_document_bundle import MineDocumentBundle
from app.api.mines.documents.models.mine_document import MineDocument
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


class MineDocumentBundleListResource(Resource, UserMixin):
    """Create / upsert a spatial document bundle (used by docman spatial processing)."""

    parser = CustomReqparser()
    parser.add_argument('name', type=str, required=True)
    parser.add_argument('docman_bundle_guid', type=str, required=False)
    parser.add_argument('geomark_id', type=str, required=False)
    parser.add_argument('validation_status', type=str, required=False)
    parser.add_argument('validation_error', type=str, required=False)
    parser.add_argument('validation_checks', type=dict, required=False)
    parser.add_argument('document_manager_guids', type=list, location='json', required=True)
    parser.add_argument('preserve_purposes', type=bool, required=False, default=True)

    @api.doc(description='Create or update a mine document spatial bundle and link documents')
    @api.marshal_with(MINE_DOCUMENT_BUNDLE_MODEL, code=200)
    @requires_any_of([VIEW_ALL, EDIT_PERMIT, MINESPACE_PROPONENT])
    def post(self):
        data = self.parser.parse_args()
        document_manager_guids = data.get('document_manager_guids') or []
        if not document_manager_guids:
            raise BadRequest('document_manager_guids is required')

        bundle = MineDocumentBundle.upsert_from_spatial_result(
            name=data['name'],
            docman_bundle_guid=data.get('docman_bundle_guid'),
            document_manager_guids=document_manager_guids,
            geomark_id=data.get('geomark_id'),
            validation_status=data.get('validation_status'),
            validation_error=data.get('validation_error'),
            validation_checks=data.get('validation_checks'),
            preserve_purposes=data.get('preserve_purposes', True),
        )
        return bundle.json()


class MineDocumentBundleResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('purpose_codes', type=list, location='json', required=False)
    parser.add_argument(
        'sibling_bundle_ids',
        type=list,
        location='json',
        required=False,
        help='Other bundle ids on the same parent record (for exclusive purpose checks)',
    )

    @api.doc(description='Returns a mine document spatial bundle')
    @api.marshal_with(MINE_DOCUMENT_BUNDLE_MODEL, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_document_bundle_id):
        mine_document_bundle = MineDocumentBundle.find_by_bundle_id(mine_document_bundle_id)
        if not mine_document_bundle:
            raise NotFound('Mine document bundle not found')

        return mine_document_bundle.json()

    @api.doc(description='Update spatial bundle purpose flags')
    @api.marshal_with(MINE_DOCUMENT_BUNDLE_MODEL, code=200)
    @requires_any_of([EDIT_PERMIT, MINESPACE_PROPONENT])
    def patch(self, mine_document_bundle_id):
        mine_document_bundle = MineDocumentBundle.find_by_bundle_id(mine_document_bundle_id)
        if not mine_document_bundle:
            raise NotFound('Mine document bundle not found')

        data = self.parser.parse_args()
        if 'purpose_codes' not in data:
            raise BadRequest('purpose_codes is required')

        sibling_ids = data.get('sibling_bundle_ids') or []
        # Infer siblings from shared mine when not provided
        if not sibling_ids and mine_document_bundle.bundle_documents:
            mine_guid = mine_document_bundle.bundle_documents[0].mine_guid
            if mine_guid:
                sibling_docs = MineDocument.query.filter_by(
                    mine_guid=mine_guid, deleted_ind=False).filter(
                        MineDocument.mine_document_bundle_id.isnot(None)).all()
                sibling_ids = list({
                    d.mine_document_bundle_id
                    for d in sibling_docs
                    if d.mine_document_bundle_id
                })

        mine_document_bundle.set_purpose_codes(data.get('purpose_codes') or [], sibling_ids)
        mine_document_bundle.save()
        return mine_document_bundle.json()
