import requests
from flask import request, Response, stream_with_context, current_app
from flask_restx import Resource, marshal
from werkzeug.exceptions import BadRequest, InternalServerError, BadGateway
from app.extensions import api, cache

from app.api.utils.resources_mixins import UserMixin
from app.api.constants import EXPLOSIVES_PERMIT_DOCUMENT_DOWNLOAD_TOKEN
from app.config import Config

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.explosives_permit.models.explosives_permit import ExplosivesPermit
from app.api.mines.explosives_permit.models.explosives_permit_document_type import ExplosivesPermitDocumentType
from app.api.mines.explosives_permit.models.explosives_permit_document_xref import ExplosivesPermitDocumentXref

from app.api.services.document_generator_service import DocumentGeneratorService
from app.api.services.document_manager_service import DocumentManagerService
from app.api.mines.explosives_permit.response_models import EXPLOSIVES_PERMIT_DOCUMENT_MODEL


class ExplosivesPermitDocumentResource(Resource, UserMixin):
    @api.doc(
        description=
        'Generates the document associated with the received token and pushes it to the Document Manager and associates it with the Explosives Permit. Returns either the file content or the document record, depending on query parameters.',
        params={
            'token':
            'The UUID4 token used to generate the document. Must be retrieved from the Explosives Permit Document Type POST endpoint.',
            'return_record':
            'If true, returns the created document record, otherwise, returns the generated file content.',
            'is_preview':
            'If true, returns the generated document without creating the document record.'
        })
    def get(self):
        token = request.args.get('token', '')
        return_record = request.args.get('return_record') == 'true'
        is_preview = request.args.get('is_preview') == 'true'
        return ExplosivesPermitDocumentResource.generate_explosives_permit_document(
            token, return_record, is_preview)

    @classmethod
    def generate_explosives_permit_document(cls,
                                            token,
                                            return_record,
                                            is_preview=False,
                                            commit=True):
        # Ensure that the token is valid
        token_data = cache.get(EXPLOSIVES_PERMIT_DOCUMENT_DOWNLOAD_TOKEN(token))
        cache.delete(EXPLOSIVES_PERMIT_DOCUMENT_DOWNLOAD_TOKEN(token))
        if not token_data:
            raise BadRequest('Valid token required for download')

        # Get the template associated with the token
        document_type_code = token_data['document_type_code']
        explosives_permit_document_type = ExplosivesPermitDocumentType.query.unbound_unsafe().get(
            document_type_code)

        # Generate the document using the template and template data
        explosives_permit_guid = token_data['explosives_permit_guid']
        explosives_permit = ExplosivesPermit.query.unbound_unsafe().get(explosives_permit_guid)
        template_data = token_data['template_data']

        template_data['document_name_start_extra'] = explosives_permit.application_number
        # TODO: Remove Logs for generate document
        current_app.logger.debug(f'token:{token}, document_type_code: {document_type_code}, explosives_permit_document_type: {explosives_permit_document_type}, explosives_permit_guid: {explosives_permit_guid}')
        docgen_resp = DocumentGeneratorService.generate_document(
            explosives_permit_document_type.document_template, template_data)
        if docgen_resp.status_code != requests.codes.ok:
            raise BadGateway(f'Failed to generate document: {str(docgen_resp.content)}')

        if not is_preview:
            # Push the document to the Document Manager
            filename = docgen_resp.headers['X-Report-Name']
            document_manager_guid = DocumentManagerService.pushFileToDocumentManager(
                file_content=docgen_resp.content,
                filename=filename,
                mine=explosives_permit.mine,
                document_category='explosives_permits',
                authorization_header=token_data['authorization_header'])

            if not document_manager_guid:
                raise InternalServerError('Error uploading document')

            # Add the document to the Explosives Permit's documents
            username = token_data['username']
            mine_doc = MineDocument(
                mine_guid=explosives_permit.mine_guid,
                document_manager_guid=document_manager_guid,
                document_name=filename,
                create_user=username,
                update_user=username)
            doc = ExplosivesPermitDocumentXref(
                mine_document=mine_doc,
                explosives_permit_document_type_code=document_type_code,
                explosives_permit_id=explosives_permit.explosives_permit_id)
            explosives_permit.documents.append(doc)
            explosives_permit.save(commit)

            explosives_permit_document_type.after_template_generated(template_data, doc,
                                                                     explosives_permit)

        # Depending on the return_record param, return the document record or file content
        if return_record and not is_preview:
            return marshal(doc, EXPLOSIVES_PERMIT_DOCUMENT_MODEL)

        file_gen_resp = Response(
            stream_with_context(
                docgen_resp.iter_content(chunk_size=Config.DOCUMENT_UPLOAD_CHUNK_SIZE_BYTES)),
            headers=dict(docgen_resp.headers))

        return file_gen_resp
