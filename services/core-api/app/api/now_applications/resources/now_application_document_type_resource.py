import uuid
from flask import request, current_app
from flask_restx import Resource, fields
from werkzeug.exceptions import NotFound, BadRequest

from app.extensions import api, cache
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.include.user_info import User
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.constants import TIMEOUT_5_MINUTES, NOW_DOCUMENT_DOWNLOAD_TOKEN
from app.api.now_applications.response_models import NOW_APPLICATION_DOCUMENT_TYPE_MODEL

NOW_DOCUMENT_DOWNLOAD_TOKEN_MODEL = api.model('NoticeOfWorkDocumentDownloadToken',
                                              {'token': fields.String})


class NOWApplicationDocumentTypeListResource(Resource, UserMixin):
    @api.doc(description='Get a list of all Notice of Work document types.')
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_DOCUMENT_TYPE_MODEL, code=200, envelope='records')
    def get(self):
        return NOWApplicationDocumentType.get_all()


class NOWApplicationDocumentTypeResource(Resource, UserMixin):
    @api.doc(
        description='Get a Notice of Work document type with context values in the document template.'
    )
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_DOCUMENT_TYPE_MODEL, code=200)
    def get(self, document_type_code):
        context_guid = request.args.get('context_guid')
        return NOWApplicationDocumentType.get_with_context(document_type_code, context_guid)


class NOWApplicationDocumentGenerateResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('now_application_guid', type=str, location='json', required=True)
    parser.add_argument('template_data', type=dict, location='json', required=True)

    @api.doc(
        description=
        'Generates the specified document for the NoW using the provided template data and issues a one-time token that is used to generate the document.',
        params={'document_type_code': 'The code indicating the type of document to generate.'})
    @api.marshal_with(NOW_DOCUMENT_DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_role_edit_permit
    def post(self, document_type_code):
        document_type = NOWApplicationDocumentType.query.get(document_type_code)
        if not document_type:
            raise NotFound('Document type not found')

        if not document_type.document_template:
            raise BadRequest(f'Cannot generate a {document_type.description}')

        data = self.parser.parse_args()

        now_application_guid = data['now_application_guid']
        now_application = NOWApplication.find_by_application_guid(now_application_guid)
        if not now_application:
            raise NotFound('Notice of Work not found')

        template_data = data['template_data']
        template_data = document_type.transform_template_data(template_data, now_application)

        # Enforce that read-only fields do not change
        enforced_data = [
            x for x in document_type.document_template._form_spec_with_context(now_application_guid)
            if x.get('read-only', False)
        ]
        for enforced_item in enforced_data:
            if template_data.get(enforced_item['id']) != enforced_item['context-value']:
                current_app.logger.debug(
                    f'OVERWRITING ENFORCED key={enforced_item["id"]}, value={template_data.get(enforced_item["id"])} -> {enforced_item["context-value"]}'
                )
            template_data[enforced_item['id']] = enforced_item['context-value']

        token = uuid.uuid4()
        # For now, we don't have a "proper" means of authorizing communication between our microservices, so this temporary solution
        # has been put in place to authorize with the document manager (pass the authorization headers into the token and re-use them
        # later). A ticket (MDS-2744) to set something else up as been created.
        cache.set(
            NOW_DOCUMENT_DOWNLOAD_TOKEN(token), {
                'document_type_code': document_type_code,
                'now_application_guid': now_application_guid,
                'template_data': template_data,
                'username': User().get_user_username(),
                'authorization_header': request.headers['Authorization']
            }, TIMEOUT_5_MINUTES)

        return {'token': token}
