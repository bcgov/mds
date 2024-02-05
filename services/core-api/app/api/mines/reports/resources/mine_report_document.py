import decimal
import uuid
import base64
import requests
import json

from datetime import datetime
from flask import request, current_app, Response
from flask_restx import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import BadRequest, NotFound
from sqlalchemy.exc import DBAPIError

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport

from app.extensions import api, db
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import requires_any_of, EDIT_REPORT, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin

from app.api.services.document_manager_service import DocumentManagerService


class MineReportDocumentListResource(Resource, UserMixin):
    @api.doc(description='Request a document_manager_guid for uploading a document')
    @requires_any_of([EDIT_REPORT, MINESPACE_PROPONENT])
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        return DocumentManagerService.initializeFileUploadWithDocumentManager(
            request, mine, 'reports')
