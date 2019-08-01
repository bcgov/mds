import decimal
import uuid
import base64
import requests
import json

from datetime import datetime
from flask import request, current_app, Response
from flask_restplus import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import BadRequest, NotFound
from sqlalchemy.exc import DBAPIError

from app.api.mines.mine.models.mine import Mine
from app.api.documents.mines.models.mine_document import MineDocument
from app.api.mines.reports.models.mine_report import MineReport

from app.extensions import api, db
from app.api.utils.custom_reqparser import CustomReqparser
from ....utils.access_decorators import requires_role_edit_do
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....utils.url import get_document_manager_svc_url

from app.api.services.document_manager_service import DocumentManagerService


class MineReportDocumentListResource(Resource, UserMixin):
    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_role_edit_do
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'reports')


class MineReportDocumentResource(Resource, UserMixin):
    @api.doc(description='Dissociate a document from a Mine Report.')
    @requires_role_edit_do
    def delete(self, mine_guid, mine_report_guid, mine_document_guid):
        if not mine_document_guid:
            raise BadRequest('must provide document_guid to be unlinked')

        mine_report = MineReport.find_by_mine_report_guid(mine_report_guid)
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if mine_report is None or mine_document is None:
            raise NotFound('Either the Expected Document or the Mine Document was not found')

        mine_report.documents.remove(mine_document)
        mine_incident.save()

        return ('', 204)
