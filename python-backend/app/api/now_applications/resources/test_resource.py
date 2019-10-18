from datetime import datetime

from flask import request, current_app
from flask_restplus import Resource
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from werkzeug.exceptions import BadRequest, InternalServerError
from sqlalchemy import and_, or_

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_party, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.parties.response_models import PARTY, PAGINATED_PARTY_LIST

from app.api.mines.mine.models.mine import Mine

from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.activity_summary.exploration_access import ExplorationAccess
from app.api.now_applications.models.activity_summary.exploration_surface_drilling import ExplorationSurfaceDrilling


class NOWApplicationResource(Resource, UserMixin):
    @requires_role_view_all
    def post(self):
        mine = Mine.query.first()
        now_application = NOWApplication(mine_guid=mine.mine_guid,
                                         notice_of_work_type_code='COL',
                                         now_application_status_code='ACC',
                                         submitted_date=datetime.utcnow(),
                                         received_date=datetime.utcnow())

        now_application.exploration_access_acts.append(ExplorationAccess(reclamation_cost=100))
        now_application.exploration_surface_drilling_acts.append(
            ExplorationSurfaceDrilling(reclamation_core_storage="this is a cool column"))
        now_application.save()
        return