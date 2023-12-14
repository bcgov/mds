from app.api.incidents.models.mine_incident import MineIncident
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.incidents.models.mine_incident_document_xref import MineIncidentDocumentXref
from app.api.mines.mine.models.mine import Mine
from app.api.mines.response_models import MINE_INCIDENT_MODEL
from app.api.services.document_manager_service import DocumentManagerService
from app.api.utils.access_decorators import EDIT_DO, MINESPACE_PROPONENT, requires_any_of
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import request
from flask_restplus import Resource
from werkzeug.exceptions import BadRequest, NotFound


class MineIncidentDocumentListResource(Resource, UserMixin):
    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(request, mine, 'incidents')


class MineIncidentDocumentResource(Resource, UserMixin):
    @api.doc(description='Adds a Document to an already existing Mine incident.')
    @api.marshal_with(MINE_INCIDENT_MODEL, 201)
    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    def put(self, mine_guid, mine_incident_guid, mine_document_guid):
        parser = CustomReqparser()
        parser.add_argument('filename', type=str, required=True)
        parser.add_argument('document_manager_guid', type=str, required=True)
        parser.add_argument('mine_incident_document_type', type=str, required=True)

        mine_incident = MineIncident.find_by_mine_incident_guid(mine_incident_guid)
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine_incident:
            raise NotFound('Mine incident not found')
        if not mine:
            raise NotFound('Mine not found.')

        data = parser.parse_args()
        document_manager_guid = data.get('document_manager_guid')
        file_name = data.get('filename')
        mine_incident_document_type = data.get('mine_incident_document_type')

        mine_doc = MineDocument(mine_guid=mine.mine_guid, document_name=file_name,
                                document_manager_guid=document_manager_guid)

        if not mine_doc:
            raise BadRequest('Unable to register uploaded file as document')

        mine_doc.save()
        mine_incident_doc = MineIncidentDocumentXref(mine_document_guid=mine_doc.mine_document_guid,
            mine_incident_id=mine_incident.mine_incident_id,
            mine_incident_document_type_code=mine_incident_document_type if mine_incident_document_type else 'INI')

        mine_incident._documents.append(mine_incident_doc)
        mine_incident.save()

        return mine_incident

    @api.doc(description='Dissociate a document from a Mine Incident.')
    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    def delete(self, mine_guid, mine_incident_guid, mine_document_guid):
        if not mine_document_guid:
            raise BadRequest('must provide document_guid to be unlinked')

        mine_incident = MineIncident.find_by_mine_incident_guid(mine_incident_guid)
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if mine_incident is None:
            raise NotFound('Mine Incident not found.')
        if mine_document is None:
            raise NotFound('Mine Document not found.')
        if mine_document not in mine_incident.mine_documents:
            raise NotFound('Mine document not found on incident.')

        mine_document.deleted_ind = True

        mine_document.save()

        return ('', 204)
