import decimal
import uuid
import requests
import json

from datetime import datetime
from flask import request, current_app
from flask_restplus import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound
from sqlalchemy.exc import DBAPIError

from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment

from app.api.services.document_manager_service import DocumentManagerService

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin

from app.api.services.issue_to_orgbook_service import OrgBookIssuerService


class PermitAmendmentIssueVCResource(Resource, UserMixin):
    @requires_role_mine_admin
    @api.response(200, "VC Issued to OrgBook, no local data created")
    def post(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)

        response = OrgBookIssuerService().issue_permit_amendment_vc(permit_amendment)
        if not response:
            return "Credential Not Issued, ensure permittee is associated with OrgBook Entity", 400
        return
