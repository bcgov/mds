from flask_restplus import Resource, reqparse, fields, inputs
from flask import request, current_app
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.documents.mines.models.mine_document import MineDocument
from app.api.utils.custom_reqparser import CustomReqparser
from ...mine_api_models import MINE_REPORT_MODEL


class MineReportListResource(Resource, UserMixin):
    parser = CustomReqparser()

    # required
    parser.add_argument('submission_year', type=str, location='json', required=True)
    parser.add_argument('mine_report_definition_id', type=str, location='json', required=True)

    parser.add_argument('permit_id', type=str, location='json')

    @api.marshal_with(MINE_REPORT_MODEL, envelope='mine_reports', code=200, as_list=True)
    @api.doc(description='returns the reports for a given mine.')
    @requires_role_mine_view
    def get(self, mine_guid):
        mine_reports = MineReport.find_by_mine_guid(mine_guid)
        if not mine_reports:
            raise BadRequest("Unable to fetch reports for that mine.")
        return mine_reports

    @api.expect(MINE_REPORT_MODEL)
    @api.doc(description='creates a new report for the mine')
    @api.marshal_with(MINE_REPORT_MODEL, code=201)
    @requires_role_mine_create
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()

        mine_report_definition = MineReportDefinition.find_by_mine_report_definition_id(
            data['mine_report_definition_id'])
        permit = Permit
        if mine_report_definition is None:
            raise BadRequest('A report must be selected from the list.')

        if 

        mine_report = MineReport.create(
            mine_report_definition_id=mine_report_definition.mine_report_definition_id,
            mine_guid=mine.mine_guid,
            submission_year=data['submission_year'],
            permit_id=data['permit_id'])

        try:
            mine_report.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return mine_report, 201


class MineReportResource(Resource, UserMixin):
    parser = CustomReqparser()
    # required

    parser.add_argument('due_date', type=str, location='json', store_missing=False)

    @api.marshal_with(MINE_REPORT_MODEL, code=200)
    @requires_role_mine_view
    def get(self, mine_guid, mine_report_guid):
        mine_report = MineReport.find_by_mine_report_guid(mine_report_guid)
        if not mine_report:
            raise NotFound("Mine Report not found")
        return mine_report

    @api.expect(parser)
    @api.marshal_with(MINE_REPORT_MODEL, code=200)
    @requires_role_mine_create
    def put(self, mine_guid, mine_report_guid):
        mine_report = MineReport.find_by_mine_report_guid(mine_report_guid)
        if not mine_report or str(mine_report.mine_guid) != mine_guid:
            raise NotFound("Mine Report not found")

        data = self.parser.parse_args()
        due_date = data.get('due_date')

        if due_date:
            mine_report.due_date = due_date

        try:
            mine_report.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')
        return mine_report
