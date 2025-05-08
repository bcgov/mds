from app.api.now_applications.models.applications_view import ApplicationsView
from app.api.now_applications.models.now_application_progress import NOWApplicationProgress
from app.api.now_applications.resources.now_application_base_list_resource import NowApplicationBaseListResource
from app.api.now_applications.response_models import NOW_VIEW_MODEL_PROPONENT
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.extensions import api
    
class NOWApplicationListProponentResource(NowApplicationBaseListResource):
    
    @api.doc(description='Get a list of Core Notice of Work applications for a particular mine proponent', params={})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(NOW_VIEW_MODEL_PROPONENT, code=200)
    def get(self, mine_guid):
        now_application_views = ApplicationsView.query.filter_by(mine_guid = mine_guid).all()
        for now in now_application_views:
            now_application_id = now.now_application_id
            now_application_progress = NOWApplicationProgress.find_by_id(now_application_id)
            if now_application_progress is None:
                now.application_progress = []
            else:
                now.application_progress = now_application_progress
        return now_application_views