
from app.api.services.document_manager_service import DocumentManagerService
from app.api.utils.access_decorators import (
    GIS,
    MINESPACE_PROPONENT,
    VIEW_ALL,
    requires_any_of,
)
from app.extensions import api
from flask_restx import Resource, fields

DOWNLOAD_TOKEN_MODEL = api.model('DownloadToken', {'token_guid': fields.String})


class DownloadTokenResource(Resource):
    @api.doc(description='Issues a one-time token for access to a document without auth headers.')
    @api.marshal_with(DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT, GIS])
    def get(self, document_guid):
        return {'token_guid': DocumentManagerService.create_download_token(document_guid)}
