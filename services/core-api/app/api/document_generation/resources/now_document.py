import os, requests
from flask import current_app, request, Response, stream_with_context
from flask_restplus import Resource
from werkzeug.exceptions import BadRequest, InternalServerError, BadGateway
from app.extensions import api, cache

from app.api.utils.resources_mixins import UserMixin
from app.api.constants import NOW_DOCUMENT_DOWNLOAD_TOKEN
from app.config import Config

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.services.document_generator_service import DocumentGeneratorService
from app.api.services.document_manager_service import DocumentManagerService
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument



class NoticeOfWorkDocumentResource(Resource, UserMixin):
    @api.doc(
        description=
        'Returns the generated document associated with the received token and pushes it to the \
        Document Manager and associates it with the Notice of Work.',
        params={
            'token':
            'The UUID4 token used to generate the document. Must be retrieved from the Notice of Work Document Type POST endpoint.'
        })
    def get(self):

        # Ensure that the token is valid
        token = request.args.get('token', '')
        token_data = cache.get(NOW_DOCUMENT_DOWNLOAD_TOKEN(token))
        cache.delete(NOW_DOCUMENT_DOWNLOAD_TOKEN(token))
        if not token_data:
            raise BadRequest('Valid token required for download')

        # Get the template associated with the token
        document_type_code = token_data['document_type_code']
        now_application_document_type = NOWApplicationDocumentType.query.unbound_unsafe().get(
            document_type_code)

        # Generate the document using the template and template data
        docgen_resp = DocumentGeneratorService.generate_document(
            now_application_document_type.document_template, token_data['template_data'])
        if docgen_resp.status_code != requests.codes.ok:
            raise BadGateway(f'Failed to generate document: {str(docgen_resp.content)}')

        # Push the document to the Document Manager
        filename = docgen_resp.headers['X-Report-Name']
        now_application_guid = token_data['now_application_guid']
        now_application_identity = NOWApplicationIdentity.query.unbound_unsafe().get(
            now_application_guid)
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

        if document_type_code == 'PMA' or document_type_code == 'PMT':
            permit_amendment = PermitAmendment.find_by_now_application_guid(now_application_guid)

            new_pa_doc = PermitAmendmentDocument(
                mine_guid=permit_amendment.mine_guid,
                document_manager_guid=document_manager_guid,
                document_name=filename)

            permit_amendment.related_documents.append(new_pa_doc)

            permit_amendment.save()



        # Return the generated document
        file_gen_resp = Response(
            stream_with_context(
                docgen_resp.iter_content(chunk_size=Config.DOCUMENT_UPLOAD_CHUNK_SIZE_BYTES)),
            headers=dict(docgen_resp.headers))
        return file_gen_resp
