from datetime import datetime

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_conditions.models import PermitConditions
from app.api.mines.reports.models.mine_report_permit_requirement import (
    CimOrCpo,
    MineReportPermitRequirement,
)
from app.api.mines.response_models import MINE_REPORT_PERMIT_REQUIREMENT
from app.api.utils.access_decorators import EDIT_REPORT, requires_any_of
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import current_app
from flask_restx import Resource
from werkzeug.exceptions import BadRequest, NotFound


class MineReportPermitRequirementResource(Resource, UserMixin):
    parser = CustomReqparser()

    parser.add_argument("due_date_period_months", type=int, location="json")
    parser.add_argument(
        "initial_due_date",
        type=lambda x: datetime.strptime(x, "%Y-%m-%d") if x else None,
        location="json",
    )
    parser.add_argument("cim_or_cpo", type=str, location="json")
    parser.add_argument("ministry_recipient", type=list, location="json")
    parser.add_argument("permit_condition_id", type=int, location="json")
    parser.add_argument("permit_amendment_id", type=int, location="json")

    @api.expect(parser)
    @api.doc(description="creates a new mine report permit requirement")
    @api.marshal_with(MINE_REPORT_PERMIT_REQUIREMENT, code=201)
    @requires_any_of([EDIT_REPORT])
    def post(self, mine_guid):
        current_app.logger.debug("CREATING REQUIREMENT")
        data = self.parser.parse_args()

        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound("Mine not found")

        permit_amendment_id = data.get("permit_amendment_id")
        permit_amendment = PermitAmendment.find_by_permit_amendment_id(
            permit_amendment_id
        )
        if permit_amendment is None:
            raise NotFound("Permit not found")

        if permit_amendment:
            permit_amendment._context_mine = mine
            if permit_amendment.mine_guid != mine.mine_guid:
                raise BadRequest(
                    "The permit must be associated with the selected mine."
                )

        permit_condition_id = data.get("permit_condition_id")
        permit_condition = PermitConditions.find_by_permit_condition_id(
            permit_condition_id
        )
        if permit_condition is None:
            raise NotFound("Permit Condition not found")

        cim_or_cpo = data.get("cim_or_cpo")
        if cim_or_cpo == "NONE":
            cim_or_cpo = None
        else:
            cim_or_cpo = CimOrCpo(cim_or_cpo)

        mine_report_permit_requirement = MineReportPermitRequirement.create(
            report_name=data.get("report_name"),
            due_date_period_months=data.get("due_date_period_months"),
            initial_due_date=data.get("initial_due_date"),
            cim_or_cpo=cim_or_cpo,
            ministry_recipient=data.get("ministry_recipient"),
            permit_condition_id=permit_condition_id,
            permit_amendment_id=permit_amendment_id,
        )

        return mine_report_permit_requirement, 201
