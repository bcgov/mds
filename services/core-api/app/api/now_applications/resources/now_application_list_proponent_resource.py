from app.api.now_applications.models.applications_view import ApplicationsView
from app.api.now_applications.models.now_application_progress import NOWApplicationProgress
from app.api.now_applications.models.now_application_tier import NOWApplicationTier
from app.api.now_applications.resources.now_application_base_list_resource import NowApplicationBaseListResource
from app.api.mines.mine.models.mine import Mine
from app.api.now_applications.response_models import NOW_VIEW_MODEL_PROPONENT
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.extensions import api
from werkzeug.exceptions import NotFound
    
class NOWApplicationListProponentResource(NowApplicationBaseListResource):
    
    @api.doc(description='Get a list of Core Notice of Work applications for a particular mine proponent', params={})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(NOW_VIEW_MODEL_PROPONENT, code=200)
    def get(self, mine_guid):
        mine_exists = Mine.find_by_mine_guid(mine_guid)
        if mine_exists is None:
            raise NotFound('Mine not found')
        now_application_views = ApplicationsView.query.filter_by(mine_guid = mine_guid).all()
        for now in now_application_views:
            now_application_id = now.now_application_id
            now_application_progress = NOWApplicationProgress.find_by_id(now_application_id)
            now_application_tier = NOWApplicationTier.find_by_id(now_application_id)
            now.application_progress = now_application_progress
            if now_application_tier:
                now.now_application_tier_code = now_application_tier.notice_of_work_tier_code
                now.now_application_tier_description = now_application_tier.description
                now.now_application_tier_created_date = now_application_tier.create_timestamp
                now.now_application_tier_updated_date = now_application_tier.update_timestamp
        return now_application_views