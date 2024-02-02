import uuid
from flask_restx import Resource, reqparse, fields, inputs
from flask import request, current_app
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_category_xref import MineReportCategoryXref
from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.mines.reports.models.mine_report_due_date_type import MineReportDueDateType
from app.api.mines.reports.models.mine_report_definition_compliance_article_xref import MineReportDefinitionComplianceArticleXref
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.response_models import MINE_REPORT_DEFINITION_MODEL


class MineReportDefinitionListResource(Resource, UserMixin):
    @api.marshal_with(MINE_REPORT_DEFINITION_MODEL, envelope='records', code=200, as_list=True)
    @api.doc(description='returns the report definitions for possible reports.')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        return MineReportDefinition.get_all()
