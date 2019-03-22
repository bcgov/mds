from flask_restplus import Resource
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters

from app.extensions import api
from app.api.utils.include.user_info import User
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.notification import Notification
from ...mine.models.mine import Mine
from flask import current_app


class MineNotificationResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'mine_guid': 'Mine guid.'})
    @requires_role_mine_view
    def get(self):
        # if mine_guid:
        #     print("****************2 The endpoint was reached *****************")
        #     #TODO Return all users subscribed to a given mine
        #     try:
        #         subscribers = Notification.find_notifications_by_mine_guid(mine_guid)
        #     except Exception:
        #         return self.create_error_payload(422, 'Invalid Mine guid'), 422
        #
        # else:
        #     print("**************** The endpoint was reached *****************")
        #     ##TODO Return all mines from a given subscriber
        #     mines = Notification.find_notifications_for_user()
#TODO clean up code
 #todo filter out deleted mines
        
        user_name = User().get_user_username()
        # name_filter = Notification.idir.like(user_name)  # Mine.mine_name.ilike('%{}%'.format(search_term))
        # mine_query = Mine.query.join(Notification).filter(name_filter)
        mine_query = Mine.query.join(Notification).filter_by(idir=user_name)

        # deleted_filter = [{'field': 'deleted_ind', 'op': '==', 'value': 'False'}]
        # mines_query = apply_filters(mine_query, deleted_filter)
        # sort_criteria = [{'model': 'Mine', 'field': 'mine_name', 'direction': 'asc'}]
        # mine_query = apply_sort(mines_query, sort_criteria)
        #paginated_mine_query, pagination_details = apply_pagination(mines_query, page, items_per_page)
        mines = mine_query.all()
        return {
            'mines': list(map(lambda x: x.json_for_list(), mines)),
        }

    @api.doc(params={'mine_guid': 'Mine guid.'})
    @requires_role_mine_view
    def post(self, mine_guid=None):
        if mine_guid:
            try:
                mine_subscription = Notification.create_subscription(mine_guid)
            except Exception:
                return self.create_error_payload(422, 'Invalid Mine guid'), 422
        else:
            return self.create_error_payload(400, 'Mine guid expected'), 400

    @api.doc(params={'mine_guid': 'Mine guid.'})
    @requires_role_mine_view
    def delete(self, mine_guid=None):
        if mine_guid:
            try:
                Notification.delete_subscription(mine_guid)
                # deleted_mine_subscription = Notification.delete_subscription(mine_guid)
            except Exception:
                return self.create_error_payload(422, 'Invalid Mine guid'), 422
        else:
            return self.create_error_payload(400, 'Mine guid expected'), 400
