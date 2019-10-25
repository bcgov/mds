from datetime import datetime

from flask import request, current_app
from flask_restplus import Resource
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_party, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.now_submissions.models.application import Application

from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.activity_summary.exploration_access import ExplorationAccess
from app.api.now_applications.models.activity_summary.exploration_surface_drilling import ExplorationSurfaceDrilling
from app.api.now_applications.models.unit_type import UnitType
from app.api.now_applications.models.activity_detail.exploration_surface_drilling_detail import ExplorationSurfaceDrillingDetail

from app.api.now_applications.transmogrify_now import transmogrify_now


class NOWApplicationImportResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('mine_guid', type=str, help='guid of the mine.', required=True)

    #@requires_role_mine_edit
    #@api.marshal_with(NOW_APPLICATION_MODEL, code=200)
    def post(self, application_guid):
        mine_guid = request.args.get('mine_guid')
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        submission = Application.query.filter_by(application_guid=application_guid).first()
        if not submission:
            raise NotFound('NoW Submission not found')

        application = transmogrify_now(submission.messageid)
        application.mine_guid = mine_guid
        application.now_application_guid = application_guid
        application.save()

        return {'CORE NOW APPLICATION GUID': application.now_application_id}
