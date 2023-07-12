from flask_restplus import fields
from app.extensions import api

CREATE_DOCUMENT_VERSION = api.model('MineDocumentVersionCreate', {
    'document_manager_version_guid': fields.String
})
