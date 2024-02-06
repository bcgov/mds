import uuid
from flask_restx import Resource, reqparse, fields, inputs

from app.extensions import api, db
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT

from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.response_models import MINE_REPORT_DEFINITION_CATEGORIES


class MineReportCategoryListResource(Resource, UserMixin):
    @api.marshal_with(MINE_REPORT_DEFINITION_CATEGORIES, envelope='records', code=200, as_list=True)
    @api.doc(description='returns the report categories for possible reports.')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        return MineReportCategory.get_all()
