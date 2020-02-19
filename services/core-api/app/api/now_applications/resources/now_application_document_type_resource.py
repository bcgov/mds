import uuid
from flask_restplus import Resource, fields
from werkzeug.exceptions import NotFound, BadRequest

from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit

from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType
from app.api.now_applications.response_models import NOW_APPLICATION_DOCUMENT_TYPES
from app.api.constants import TIMEOUT_5_MINUTES, NOW_DOCUMENT_DOWNLOAD_TOKEN
from app.api.utils.custom_reqparser import CustomReqparser

NOW_DOCUMENT_DOWNLOAD_TOKEN_MODEL = api.model('NoticeOfWorkDocumentDownloadToken',
                                              {'token_guid': fields.String})


class NOWApplicationDocumentTypeResource(Resource, UserMixin):
    @api.doc(description='Get a list of all Notice of Work document types', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_DOCUMENT_TYPES, code=200, envelope='records')
    def get(self):
        return NOWApplicationDocumentType.active()


class NOWApplicationDocumentGenerateResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('now_application_guid', type=str, location='json', required=True)
    parser.add_argument('template_data', type=str, location='json', required=True)

    @api.doc(
        description=
        'Generates the specified document for the NoW using the provided template data and issues a one-time token that is used to download the document.',
        params={'document_type_code': 'The code indicating the type of document to generate.'})
    @api.marshal_with(NOW_DOCUMENT_DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_role_edit_permit
    def post(self, document_type_code):
        if not document_type_code:
            raise NotFound('Document type code not found')

        # TODO: Generate document using the provided data.
        data = self.parser.parse_args()

        token_guid = uuid.uuid4()
        cache.set(
            NOW_DOCUMENT_DOWNLOAD_TOKEN(token_guid), {'document_type_code': document_type_code},
            TIMEOUT_5_MINUTES)

        return {'token_guid': token_guid}
