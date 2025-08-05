from datetime import datetime

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_conditions.models import PermitConditions
from app.api.mines.permits.permit_conditions.models.standard_permit_conditions import StandardPermitConditions
from app.api.mines.reports.models.mine_report_permit_requirement import (
    CimOrCpo,
    StandardReportPermitRequirement,
)
from app.api.mines.response_models import MINE_REPORT_PERMIT_REQUIREMENT
from app.api.utils.access_decorators import requires_any_of, requires_role_edit_standard_permit_conditions, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import current_app
from flask_restx import Resource
from werkzeug.exceptions import BadRequest, NotFound
from flask_restx import reqparse
from sqlalchemy.exc import IntegrityError

class StandardReportPermitRequirementResource(Resource, UserMixin):
    parser = CustomReqparser()

    parser.add_argument("mine_report_permit_requirement_id", type=int, location="json")
    parser.add_argument("due_date_period_months", type=int, location="json")
    parser.add_argument("cim_or_cpo", type=str, location="json")
    parser.add_argument("ministry_recipient", type=list, location="json")
    parser.add_argument("permit_condition_ids", type=list, location="json")
    parser.add_argument("report_name", type=str, location="json")

    @api.expect(parser)
    @api.doc(description="Creates a new report requirement for standard/template conditions")
    @api.marshal_with(MINE_REPORT_PERMIT_REQUIREMENT, code=201)
    @requires_role_edit_standard_permit_conditions
    def post(self):
        data = self.parser.parse_args()

        permit_condition_ids = data.get("permit_condition_ids")
        permit_conditions = StandardPermitConditions.find_many_by_permit_condition_ids(permit_condition_ids)

        if not permit_conditions:
            raise NotFound("Standard Permit Conditions not found")
        
        cim_or_cpo = data.get("cim_or_cpo")
        cim_or_cpo = None if cim_or_cpo == "None" else CimOrCpo(cim_or_cpo)

        try:
            standard_report_permit_requirement = StandardReportPermitRequirement.create(
                report_name=data.get("report_name"),
                due_date_period_months=data.get("due_date_period_months"),
                cim_or_cpo=cim_or_cpo,
                ministry_recipient=data.get("ministry_recipient"),
                permit_condition_ids=permit_condition_ids
            )
        except IntegrityError as e:
            current_app.logger.info(e)

        return standard_report_permit_requirement, 201
    
    @api.expect(parser)
    @api.doc(description="Update a standard report requirement")
    @api.marshal_with(MINE_REPORT_PERMIT_REQUIREMENT, code=200)
    @requires_role_edit_standard_permit_conditions
    def put(self):
        data = self.parser.parse_args()

        mine_report_permit_requirement_id = data.get("mine_report_permit_requirement_id", None)
        report_requirement = StandardReportPermitRequirement.find_by_mine_report_permit_requirement_id(mine_report_permit_requirement_id)
        if not report_requirement:
            raise NotFound(f"Report requirement with id {mine_report_permit_requirement_id} not found.")

        permit_condition_ids = data.get("permit_condition_ids")

        if not permit_condition_ids or len(permit_condition_ids) == 0:
            raise BadRequest("Report requirement must be associated with one or more standard permit conditions.")
        
        permit_conditions = StandardPermitConditions.find_many_by_permit_condition_ids(permit_condition_ids
                                                                               )
        if len(permit_conditions) != len(permit_condition_ids):
            not_found_ids = [x.permit_condition_id for x in permit_conditions if x.permit_condition_id not in permit_condition_ids]
            current_app.logger.info(f"Standard conditions with the following ids were not found: {', '.join(map(str, not_found_ids))}")
            raise BadRequest(f"{len(not_found_ids)} standard conditions were not found")
            
        cim_or_cpo = data.get("cim_or_cpo")
        data['cim_or_cpo'] = None if cim_or_cpo == "None" else CimOrCpo(cim_or_cpo)

        try:
            report_requirement.update(**data)
        except IntegrityError as e:
            current_app.logger.info(e)
            raise BadRequest(self.unique_report_error_message)
        return report_requirement
        

    @api.doc(description="Return all standard report requirements")
    @api.marshal_with(MINE_REPORT_PERMIT_REQUIREMENT, code=200, envelope="records")
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        records = StandardReportPermitRequirement.get_all()
        return records
    
    @api.doc(description='Delete a standard report permit requirement')
    @api.response(204, "Successfully deleted report requirement.")
    @requires_role_edit_standard_permit_conditions
    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'mine_report_permit_requirement_id',
            type=int,
            location='args',
            required=True,
            help='Standard report permit requirement id to help identify report requirement'
        )
        args = parser.parse_args()
        mine_report_permit_requirement_id = args.get('mine_report_permit_requirement_id')

        report_requirement = StandardReportPermitRequirement.find_by_mine_report_permit_requirement_id(
            mine_report_permit_requirement_id
            )
        if not report_requirement:
            raise NotFound(f"Report requirement with id {mine_report_permit_requirement_id} not found")


        report_requirement.delete()
        current_app.logger.info(f'Deleting {report_requirement}')
