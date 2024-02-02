import requests
from flask import request, Response, stream_with_context
from flask_restx import Resource, marshal
from werkzeug.exceptions import BadRequest, InternalServerError, BadGateway
from app.extensions import api, cache

from app.api.utils.resources_mixins import UserMixin
from app.api.constants import NOW_DOCUMENT_DOWNLOAD_TOKEN
from app.config import Config

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.services.document_generator_service import DocumentGeneratorService
from app.api.services.document_manager_service import DocumentManagerService
from app.api.now_applications.response_models import NOW_APPLICATION_DOCUMENT


class NoticeOfWorkDocumentResource(Resource, UserMixin):
    @api.doc(
        description=
        'Generates the document associated with the received token and pushes it to the Document Manager and associates it with the Notice of Work. Returns either the file content or the document record, depending on query parameters.',
        params={
            'token':
            'The UUID4 token used to generate the document. Must be retrieved from the Notice of Work Document Type POST endpoint.',
            'return_record':
            'If true, returns the created document record, otherwise, returns the generated file content.',
            'is_preview':
            'If true, returns the generated document without creating the document record.'
        })
    def get(self):
        token = request.args.get('token', '')
        return_record = request.args.get('return_record') == 'true'
        is_preview = request.args.get('is_preview') == 'true'
        return NoticeOfWorkDocumentResource.generate_now_document(token, return_record, is_preview)

    @classmethod
    def generate_now_document(cls, token, return_record, is_preview=False):
        # Ensure that the token is valid
        token_data = cache.get(NOW_DOCUMENT_DOWNLOAD_TOKEN(token))
        cache.delete(NOW_DOCUMENT_DOWNLOAD_TOKEN(token))
        if not token_data:
            raise BadRequest('Valid token required for download')

        # Get the template associated with the token
        document_type_code = token_data['document_type_code']
        now_application_document_type = NOWApplicationDocumentType.query.unbound_unsafe().get(
            document_type_code)

        # Generate the document using the template and template data
        now_application_guid = token_data['now_application_guid']
        now_application_identity = NOWApplicationIdentity.query.unbound_unsafe().get(
            now_application_guid)
        template_data = token_data['template_data']
        template_data['document_name_start_extra'] = now_application_identity.now_number
        docgen_resp = DocumentGeneratorService.generate_document(
            now_application_document_type.document_template, template_data)
        if docgen_resp.status_code != requests.codes.ok:
            raise BadGateway(f'Failed to generate document: {str(docgen_resp.content)}')

        if not is_preview:
            # Push the document to the Document Manager
            filename = docgen_resp.headers['X-Report-Name']
            document_manager_guid = DocumentManagerService.pushFileToDocumentManager(
                file_content=docgen_resp.content,
                filename=filename,
                mine=now_application_identity.mine,
                document_category='noticeofwork',
                authorization_header=token_data['authorization_header'])

            if not document_manager_guid:
                raise InternalServerError('Error uploading document')

            # Add the document to the Notice of Work's documents
            username = token_data['username']
            new_mine_doc = MineDocument(
                mine_guid=now_application_identity.now_application.mine_guid,
                document_manager_guid=document_manager_guid,
                document_name=filename,
                create_user=username,
                update_user=username)
            now_doc = NOWApplicationDocumentXref(
                mine_document=new_mine_doc,
                now_application_document_type=now_application_document_type,
                now_application_id=now_application_identity.now_application_id,
                create_user=username,
                update_user=username)
            now_application_identity.now_application.documents.append(now_doc)
            now_application_identity.save()

            now_application = NOWApplication.find_by_application_guid(now_application_guid)
            now_application_document_type.after_template_generated(template_data, now_doc,
                                                                   now_application)

        # Depending on the return_record param, return the document record or file content
        if return_record and not is_preview:
            return marshal(now_doc, NOW_APPLICATION_DOCUMENT)

        file_gen_resp = Response(
            stream_with_context(
                docgen_resp.iter_content(chunk_size=Config.DOCUMENT_UPLOAD_CHUNK_SIZE_BYTES)),
            headers=dict(docgen_resp.headers))

        return file_gen_resp
