from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, is_minespace_user
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.projects.response_models import MAJOR_MINE_APPLICATION_MODEL
from app.api.projects.major_mine_application.models.major_mine_application import MajorMineApplication


class MajorMineApplicationResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('submission_project_title', type=str, required=True)

    @api.doc(
        description="Get a Mine Major Applications for a given project.",
        params={'project_guid': 'The GUID of the project to get Mine Major Applications for.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(MAJOR_MINE_APPLICATION_MODEL, code=200)
    def get(self, project_guid, major_mine_application_guid):
        mine_major_application = MajorMineApplication.find_by_major_mine_application_guid(
            major_mine_application_guid)
        if mine_major_application is None:
            raise NotFound('Major mine application not found.')

        return mine_major_application
