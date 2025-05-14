from flask_restx import Resource
from app.api.now_applications.models.applications_view import ApplicationsView
from app.api.now_applications.models.now_application_progress import NOWApplicationProgress
from app.api.now_applications.response_models import NOW_VIEW_MODEL_PROPONENT
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from werkzeug.exceptions import NotFound
    
class NOWApplicationProponentResource(Resource, UserMixin):
    
    @api.doc(description='Get a Core Notice of Work application for a mine proponent', params={})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(NOW_VIEW_MODEL_PROPONENT, code=200)
    def get(self, now_application_guid):
        now_application_view = ApplicationsView.query.filter_by(now_application_guid = now_application_guid).one_or_none()
        if now_application_view is None:
            raise NotFound('Notice of Work application view not found')
        now_application_id = now_application_view.now_application_id
        now_application_progress = NOWApplicationProgress.find_by_id(now_application_id)
        now_application_view.application_progress = now_application_progress
        return now_application_view