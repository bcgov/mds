from flask_restx import Resource, reqparse
from flask import request
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, EDIT_CODE

from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.response_models import PAGINATED_MINE_REPORT_DEFINITION_MODEL, MINE_REPORT_DEFINITION_MODEL


class MineReportDefinitionResource(Resource):
    @api.marshal_with(MINE_REPORT_DEFINITION_MODEL, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_report_definition_guid):
        mine_report_definition = MineReportDefinition.find_by_mine_report_definition_guid(mine_report_definition_guid)

        if not mine_report_definition:
            raise NotFound(
                f"Mine Report Definition with guid '{mine_report_definition_guid}' not found.")

        return mine_report_definition