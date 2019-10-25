from datetime import datetime

from flask import request, current_app
from flask_restplus import Resource
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound
from sqlalchemy import and_, or_

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_party, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.parties.response_models import PARTY, PAGINATED_PARTY_LIST

from app.api.mines.mine.models.mine import Mine

from app.api.now_submissions.models.application import Application

from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.activity_summary.exploration_access import ExplorationAccess
from app.api.now_applications.models.activity_summary.exploration_surface_drilling import ExplorationSurfaceDrilling
from app.api.now_applications.models.unit_type import UnitType
from app.api.now_applications.models.activity_detail.exploration_surface_drilling_detail import ExplorationSurfaceDrillingDetail

from app.api.now_applications.now_import import transmogrify_now


class NOWApplicationResource(Resource, UserMixin):
    def post(self, application_guid):
        submission = Application.query.filter_by(application_guid=application_guid).first()
        if not submission:
            raise NotFound('now submission with that guid')
        application = transmogrify_now(submission.messageid)
        application.save()
        current_app.logger.debug(f"""
        {submission} -> {application}
        Camps = {str(application.camps)}
        Cut Lines polarization = {str(application.exploration_surface_drilling)}
        Exploration Surface Drilling = {str(application.mechanical_trenching)}
        Placer Operation = {str(application.placer_operation)}
        Blasting = {str(application.blasting)}
        Sand and Gravel = {str(application.sand_and_gravel)}
        Surface Bulk Sample = {str(application.surface_bulk_sample)}
        Water Sources = {str(application.water_source_activites)}
        Underground Exploration = {str(application.underground_exploration)}""")

        return {'CORE NOW APPLICATION GUID': application.now_application_id}
