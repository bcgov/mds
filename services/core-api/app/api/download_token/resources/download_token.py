import uuid
from flask_restx import Resource, fields

from app.extensions import api, cache
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, GIS
from app.api.constants import DOWNLOAD_TOKEN, TIMEOUT_5_MINUTES

DOWNLOAD_TOKEN_MODEL = api.model('DownloadToken', {'token_guid': fields.String})


class DownloadTokenResource(Resource):
    @api.doc(description='Issues a one-time token for access to a document without auth headers.')
    @api.marshal_with(DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT, GIS])
    def get(self, document_guid):
        token_guid = uuid.uuid4()
        cache.set(DOWNLOAD_TOKEN(token_guid), document_guid, TIMEOUT_5_MINUTES)
        return {'token_guid': token_guid}
