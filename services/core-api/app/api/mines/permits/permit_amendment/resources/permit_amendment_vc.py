from datetime import datetime
from flask import request, current_app
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest

from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment

from app.extensions import api
from app.api.utils.access_decorators import requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin

from app.api.services.issue_to_orgbook_service import OrgBookIssuerService


class PermitAmendmentVCResource(Resource, UserMixin):
    @requires_role_mine_admin
    @api.response(200, "VC Issued to OrgBook, no local data created")
    def post(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)

        response = OrgBookIssuerService().issue_permit_amendment_vc(permit_amendment)
        if not response:
            raise BadRequest(
                "Credential Not Issued, ensure permittee is associated with OrgBook Entity")
        return
