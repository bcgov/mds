from flask_restx import Resource
from werkzeug.exceptions import BadRequest, NotFound
from sqlalchemy.orm import noload

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.reports.models.mine_report_permit_requirement import MineReportPermitRequirement
from app.api.mines.response_models import PERMIT_CONDITIONS_DATA_MODEL


# This is meant to be a resource that returns just the data needed to 
# populate the permit conditions page for a given permit amendment.
class PermitConditionsDataResource(Resource, UserMixin):
    @api.doc(params={'permit_amendment_guid': 'Permit amendment guid.'})
    @requires_role_view_all
    @api.marshal_with(PERMIT_CONDITIONS_DATA_MODEL, code=200)
    def get(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = (
            PermitAmendment.query
            .options(
                noload("vc_credential_exch"),
                noload("now_application_identity"),
            )
            .filter_by(permit_amendment_guid=permit_amendment_guid, deleted_ind=False)
            .first()
        )
        if not permit_amendment:
            raise NotFound('Permit Amendment not found.')
        if not str(permit_amendment.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and supplied mine_guid mismatch.')

        permit_amendment.mine_report_permit_requirements = MineReportPermitRequirement.query.filter_by(
            permit_amendment_id=permit_amendment.permit_amendment_id, deleted_ind=False).all()

        return permit_amendment
