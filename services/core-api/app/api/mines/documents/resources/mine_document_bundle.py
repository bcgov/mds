from flask_restx import Resource
from werkzeug.exceptions import NotFound

from app.api.mines.documents.models.mine_document_bundle import MineDocumentBundle
from app.api.utils.access_decorators import VIEW_ALL, MINESPACE_PROPONENT, requires_any_of
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api


class MineDocumentBundleResource(Resource, UserMixin):
    @api.doc(description='Returns list of documents associated with mines')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_document_bundle_id):
        mine_document_bundle = MineDocumentBundle.find_by_bundle_id(mine_document_bundle_id)
        if not mine_document_bundle:
            raise NotFound('Mine document bundle not found')

        return mine_document_bundle.json()