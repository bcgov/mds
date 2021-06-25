import uuid
from flask import request
from flask_restplus import Resource, fields
from werkzeug.exceptions import NotFound, BadRequest

from app.extensions import api, cache
from app.api.mines.explosives_permit.models.explosives_permit import ExplosivesPermit
from app.api.mines.explosives_permit.models.explosives_permit_document_type import ExplosivesPermitDocumentType
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.include.user_info import User
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.constants import TIMEOUT_5_MINUTES, EXPLOSIVES_PERMIT_DOCUMENT_DOWNLOAD_TOKEN
from app.api.mines.explosives_permit.response_models import EXPLOSIVES_PERMIT_DOCUMENT_TYPE_MODEL

EXPLOSIVES_PERMIT_DOCUMENT_DOWNLOAD_TOKEN_MODEL = api.model('ExplosivesPermitDocumentDownloadToken',
                                                            {'token': fields.String})


class ExplosivesPermitDocumentTypeListResource(Resource, UserMixin):
    @api.doc(description='Get a list of all Explosives Permit document types.')
    @requires_role_view_all
    @api.marshal_with(EXPLOSIVES_PERMIT_DOCUMENT_TYPE_MODEL, code=200, envelope='records')
    def get(self):
        return ExplosivesPermitDocumentType.get_all()


class ExplosivesPermitDocumentTypeResource(Resource, UserMixin):
    @api.doc(description=
             'Get an Explosives Permit document type with context values in the document template.')
    @requires_role_view_all
    @api.marshal_with(EXPLOSIVES_PERMIT_DOCUMENT_TYPE_MODEL, code=200)
    def get(self, document_type_code):
        context_guid = request.args.get('context_guid')
        return ExplosivesPermitDocumentType.get_with_context(document_type_code, context_guid)


class ExplosivesPermitDocumentGenerateResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('explosives_permit_guid', type=str, location='json', required=True)
    parser.add_argument('template_data', type=dict, location='json', required=True)

    @api.doc(
        description=
        'Generates the specified document for the Explosives Permit using the provided template data and issues a one-time token that is used to generate the document.',
        params={'document_type_code': 'The code indicating the type of document to generate.'})
    @api.marshal_with(EXPLOSIVES_PERMIT_DOCUMENT_DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_role_mine_edit
    def post(self, document_type_code):
        document_type = ExplosivesPermitDocumentType.query.get(document_type_code)
        if not document_type:
            raise NotFound('Document type not found')

        document_template = document_type.document_template
        if not document_template:
            raise BadRequest(f'Cannot generate a {document_type.description}')

        data = self.parser.parse_args()

        explosives_permit_guid = data['explosives_permit_guid']
        explosives_permit = ExplosivesPermit.find_by_explosives_permit_guid(explosives_permit_guid)
        if not explosives_permit:
            raise NotFound('Explosives Permit not found')

        template_data = data['template_data']
        template_data = document_type.transform_template_data(template_data, explosives_permit)

        form_spec_with_context = document_template._form_spec_with_context(explosives_permit_guid)
        enforced_data = [x for x in form_spec_with_context if x.get('read-only') == True]
        for enforced_item in enforced_data:
            template_data[enforced_item['id']] = enforced_item['context-value']

        token = uuid.uuid4()
        cache.set(
            EXPLOSIVES_PERMIT_DOCUMENT_DOWNLOAD_TOKEN(token), {
                'document_type_code': document_type_code,
                'explosives_permit_guid': explosives_permit_guid,
                'template_data': template_data,
                'username': User().get_user_username(),
                'authorization_header': request.headers['Authorization']
            }, TIMEOUT_5_MINUTES)

        return {'token': token}
