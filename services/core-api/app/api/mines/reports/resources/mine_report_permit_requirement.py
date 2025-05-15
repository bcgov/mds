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
from flask_restx import reqparse
from sqlalchemy.exc import IntegrityError


class MineReportPermitRequirementResource(Resource, UserMixin):
    unique_report_error_message = "Report name must be unique"

    parser = CustomReqparser()

    parser.add_argument("mine_report_permit_requirement_id", type=int, location="json")
    parser.add_argument("due_date_period_months", type=int, location="json")
    parser.add_argument(
        "initial_due_date",
        type=lambda x: datetime.strptime(x, "%Y-%m-%d") if x else None,
        location="json",
    )
    parser.add_argument("cim_or_cpo", type=str, location="json")
    parser.add_argument("ministry_recipient", type=list, location="json")
    parser.add_argument("permit_condition_ids", type=list, location="json")
    parser.add_argument("permit_amendment_id", type=int, location="json")
    parser.add_argument("report_name", type=str, location="json")

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

        permit_condition_ids = data.get("permit_condition_ids")
        permit_conditions = PermitConditions.find_many_by_permit_condition_ids(permit_condition_ids
                                                                               )
        if not permit_conditions:
            raise NotFound("Permit Conditions not found")
        for condition in permit_conditions:
            if condition.permit_amendment_id != permit_amendment_id:
                raise BadRequest(
                    "The permit condition is not associated with the given permit amendment"
                )

        cim_or_cpo = data.get("cim_or_cpo")
        if cim_or_cpo == "NONE":
            cim_or_cpo = None
        else:
            cim_or_cpo = CimOrCpo(cim_or_cpo)

        try:
            mine_report_permit_requirement = MineReportPermitRequirement.create(
                report_name=data.get("report_name"),
                due_date_period_months=data.get("due_date_period_months"),
                initial_due_date=data.get("initial_due_date"),
                cim_or_cpo=cim_or_cpo,
                ministry_recipient=data.get("ministry_recipient"),
                permit_condition_ids=permit_condition_ids,
                permit_amendment_id=permit_amendment_id,
            )
        except IntegrityError as e:
            current_app.logger.info(e)
            raise BadRequest(self.unique_report_error_message)

        return mine_report_permit_requirement, 201
    
    @api.doc(description='Delete a mine report permit requirement')
    @api.response(204, "Successfully deleted report requirement.")
    @requires_any_of([EDIT_REPORT])
    def delete(self, mine_guid):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'mine_report_permit_requirement_id',
            type=int,
            location='args',
            required=True,
            help='Mine report permit requirement id to help identify report requirement'
        )
        args = parser.parse_args()

        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound("Mine not found")
        
        mine_report_permit_requirement = MineReportPermitRequirement.find_by_mine_report_permit_requirement_id(
            args['mine_report_permit_requirement_id']
            )
        if not mine_report_permit_requirement:
            raise NotFound(f"Report requirement with id {args['mine_report_permit_requirement_id']} not found")
        
        permit_amendment = PermitAmendment.find_by_permit_amendment_id(
            mine_report_permit_requirement.permit_amendment_id
        )
        if permit_amendment is None:
            raise NotFound("Permit not found")
        if permit_amendment:
            permit_amendment._context_mine = mine
            if permit_amendment.mine_guid != mine.mine_guid:
                raise BadRequest(
                    "The report requirement to be deleted is not part of a permit associated with the given mine"
                )
        
        mine_report_permit_requirement.delete()
        current_app.logger.info(f'Deleting {mine_report_permit_requirement}')

        return ('', 204)
    
    @api.expect(parser)
    @api.doc(description='Update a mine report permit requirement')
    @api.marshal_with(MINE_REPORT_PERMIT_REQUIREMENT, code=200)
    @requires_any_of([EDIT_REPORT])
    def put(self, mine_guid):
        data = self.parser.parse_args()

        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound("Mine not found")
        
        mine_report_permit_requirement_id = data.get("mine_report_permit_requirement_id", None)
        mine_report_permit_requirement = MineReportPermitRequirement.find_by_mine_report_permit_requirement_id(mine_report_permit_requirement_id)
        if not mine_report_permit_requirement:
            raise NotFound(f"Report requirement with id {mine_report_permit_requirement_id} not found.")

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
                    "The report requirement to be updated is not part of a permit associated with the given mine"
                )
            
            if permit_amendment_id != mine_report_permit_requirement.permit_amendment_id:
                raise BadRequest(
                    "The report requirement to be updated is not associated with the given permit"
                )

        permit_condition_ids = data.get("permit_condition_ids")

        if not permit_condition_ids or len(permit_condition_ids) == 0:
            raise BadRequest("Report requirement must be associated with one or more permit conditions.")
        
        permit_conditions = PermitConditions.find_many_by_permit_condition_ids(permit_condition_ids
                                                                               )
        if len(permit_conditions) != len(permit_condition_ids):
            not_found_ids = [x.permit_condition_id for x in permit_conditions if x.permit_condition_id not in permit_condition_ids]
            current_app.logger.info(f"Permit conditions with the following ids were not found: {', '.join(map(str, not_found_ids))}")
            raise BadRequest(f"{len(not_found_ids)} permit conditions were not found")
        
        for condition in permit_conditions:
            if condition.permit_amendment_id != permit_amendment_id:
                current_app.logger.info(f"Permit condition {condition.permit_condition_id} is not associated with amendment {permit_amendment_id}")
                raise BadRequest(
                    "The permit condition is not associated with the given permit amendment"
                )
            
        cim_or_cpo = data.get("cim_or_cpo")
        if cim_or_cpo == "NONE":
            cim_or_cpo = None
        else:
            cim_or_cpo = CimOrCpo(cim_or_cpo)
        
        data['cim_or_cpo'] = cim_or_cpo

        try:
            mine_report_permit_requirement.update(**data)
        except IntegrityError as e:
            current_app.logger.info(e)
            raise BadRequest(self.unique_report_error_message)

        return mine_report_permit_requirement