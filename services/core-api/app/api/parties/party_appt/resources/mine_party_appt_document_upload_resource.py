import requests
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from flask import request, current_app
from flask_restx import Resource
from app.extensions import api

from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import (requires_any_of, EDIT_PARTY, MINESPACE_PROPONENT)

from app.api.mines.mine.models.mine import Mine
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.parties.response_models import MINE_PARTY_APPT
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.parties.party_appt.models.mine_party_appt_document_xref import MinePartyApptDocumentXref

from app.api.services.document_manager_service import DocumentManagerService


class MinePartyApptDocumentUploadResource(Resource, UserMixin):
    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def post(self, mine_guid, mine_party_appt_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'mine_party_appts')


    @api.doc(description='Associate an uploaded file with a mine_party_appt.',
             params={
                 'mine_guid': 'guid for the mine with which the party_appt is associated',
                 'mine_party_appt_guid': 'GUID for the mine_party_appt to which the document should be associated'
             })
    @api.marshal_with(MINE_PARTY_APPT, code=200)
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def put(self, mine_guid, mine_party_appt_guid):
        parser = CustomReqparser()
        # Arguments required by MineDocument
        parser.add_argument('document_name', type=str, required=True)
        parser.add_argument('document_manager_guid', type=str, required=True)

        mine_party_appt = MinePartyAppointment.find_by_mine_party_appt_guid(mine_party_appt_guid)

        if not mine_party_appt:
            raise NotFound('Mine Party Appointment.')

        data = parser.parse_args()
        document_name = data.get('document_name')
        document_manager_guid = data.get('document_manager_guid')

        # Register new file upload
        mine_doc = MineDocument(mine_guid=mine_guid,
                                document_manager_guid=document_manager_guid,
                                document_name=document_name)

        if not mine_doc:
            raise BadRequest('Unable to register uploaded file as document')

        mine_doc.save()
        mine_party_appt.documents.append(mine_doc)
        mine_party_appt.save()
        return mine_party_appt
