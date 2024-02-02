import decimal
import uuid
import requests
import json

from datetime import datetime
from flask import request, current_app
from flask_restx import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound
from sqlalchemy.exc import DBAPIError

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument

from app.api.services.document_manager_service import DocumentManagerService

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_edit_permit
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.response_models import PERMIT_AMENDMENT_DOCUMENT_MODEL


class PermitAmendmentDocumentListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('mine_guid', type=str, store_missing=False)
    parser.add_argument('document_manager_guid', type=str, store_missing=False)
    parser.add_argument('filename', type=str, store_missing=False)

    @api.expect(parser)
    @api.marshal_with(PERMIT_AMENDMENT_DOCUMENT_MODEL, code=201)
    @requires_role_edit_permit
    def put(self, mine_guid, permit_amendment_guid, permit_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not permit_amendment:
            raise NotFound('Permit amendment not found.')
        if not str(permit_amendment.permit_guid) == permit_guid:
            raise BadRequest('Amendment and permit permit_guid mismatch.')
        if not str(permit_amendment.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and supplied mine_guid mismatch.')

        data = self.parser.parse_args()
        if data.get('document_manager_guid'):
            # Register and associate a new file upload
            filename = data.get('filename')
            if not filename:
                raise BadRequest('Must supply filename for new file upload.')

            new_pa_doc = PermitAmendmentDocument(
                mine_guid=permit_amendment.mine_guid,
                document_manager_guid=data.get('document_manager_guid'),
                document_name=filename)

            permit_amendment.related_documents.append(new_pa_doc)
            permit_amendment.save()
        else:
            raise BadRequest('Must provide the doc manager guid for the newly uploaded file.')

        return new_pa_doc


class PermitAmendmentDocumentResource(Resource, UserMixin):
    @requires_role_edit_permit
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, permit_guid, permit_amendment_guid, permit_amendment_document_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        permit_amendment_doc = PermitAmendmentDocument.find_by_permit_amendment_document_guid(
            permit_amendment_document_guid)

        if permit_amendment is None:
            raise NotFound('The permit amendment was not found.')

        if permit_amendment_doc is None:
            raise NotFound('The amendments attached document was not found.')

        if not str(permit_amendment.permit_guid) == permit_guid:
            raise BadRequest('Amendment and permit permit_guid mismatch.')

        if not str(permit_amendment.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and supplied mine_guid mismatch.')

        permit_amendment.related_documents.remove(permit_amendment_doc)
        permit_amendment.save()

        return
