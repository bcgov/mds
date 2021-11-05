from flask_restplus import Resource
from flask import request
from datetime import datetime
from sqlalchemy import desc, cast, NUMERIC, extract, asc
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from werkzeug.exceptions import BadRequest

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.mine.models.mine import Mine
from app.api.incidents.models.mine_incident import MineIncident
from app.api.incidents.models.mine_incident_do_subparagraph import MineIncidentDoSubparagraph
from app.api.incidents.response_models import PAGINATED_INCIDENT_LIST

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class ProjectSummaryResource(Resource, UserMixin):
    @api.doc(description='', params={})
    @requires_any_of([VIEW_ALL])
    # @api.marshal_with(, code=200)
    def get(self):
        args = {
            "page_number": request.args.get('page', PAGE_DEFAULT, type=int),
            "page_size": request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            "status": request.args.getlist('incident_status', type=str),
            "determination": request.args.getlist('determination', type=str),
            "codes": request.args.getlist('codes', type=str),
            'major': request.args.get('major', type=str),
            'region': request.args.getlist('region', type=str),
            'year': request.args.get('year', type=str),
            'search_terms': request.args.get('search', type=str),
            'sort_field': request.args.get('sort_field', type=str),
            'sort_dir': request.args.get('sort_dir', type=str),
            'mine_guid': request.args.get('mine_guid', type=str),
        }

        raise NotImplemented
