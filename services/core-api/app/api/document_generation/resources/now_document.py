import os
from flask import current_app, request, Response, stream_with_context
from flask_restplus import Resource
from werkzeug.exceptions import BadRequest, NotFound
from app.extensions import api, cache

from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.constants import NOW_DOCUMENT_DOWNLOAD_TOKEN
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.services.document_generator_service import DocumentGeneratorService
from app.api.services.document_manager_service import DocumentManagerService


class NoticeOfWorkDocumentResource(Resource, UserMixin):
    @api.doc(
        description=
        'Returns the generated document associated with the received token and pushes it to the \
        Document Manager and associates it with the Notice of Work.',
        params={'token': 'uuid4 token to execute the planned file generation for that token'})
    def get(self):

        # Ensure that the token is valid
        token = request.args.get('token', '')
        token_data = cache.get(NOW_DOCUMENT_DOWNLOAD_TOKEN(token))
        cache.delete(NOW_DOCUMENT_DOWNLOAD_TOKEN(token))
        if not token_data:
            raise BadRequest('Valid token required for download')
        current_app.logger.warn(f'*** token_data: {token_data}')

        # Get the template associated with the token
        doc_type = NOWApplicationDocumentType.query.unbound_unsafe().get(
            token_data['document_type_code'])
        template_path = os.path.join(current_app.root_path,
                                     doc_type.document_template.template_file_path)

        # Generate the document using the template and template data
        docgen_resp = DocumentGeneratorService.generate_document_and_stream_response(
            template_path, data=token_data['template_data'])
        current_app.logger.warn(f'*** docgen_resp.headers: {docgen_resp.headers}')

        # Push the document to the Document Manager
        docman_resp = DocumentManagerService.pushFileToDocumentManager(
            file_content=docgen_resp.content, filename=docgen_resp.headers['Carbone-Report-Name'])
        current_app.logger.warn(f'*** docman_resp.headers: {docman_resp.headers}')

        # Associate the document with the Notice of Work
        now_application_guid = token_data['now_application_guid']
        # now_application = NOWApplication.query.unbound_unsafe().get(now_application_guid)
        # now_doc = NOWApplicationDocumentXref(
        #         mine_document=new_mine_doc,
        #         now_application_document_type_code='PUB' if new_review.now_application_review_type_code == 'PUB' else 'REV',
        #         now_application_id=now_application.now_application.now_application_id,
        #     )

        # Return the generated document
        file_gen_resp = Response(
            stream_with_context(docgen_resp.iter_content(chunk_size=2048)),
            headers=dict(docgen_resp.headers))
        return file_gen_resp
