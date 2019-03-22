from flask_restplus import Resource
from sqlalchemy_filters import apply_sort

from app.extensions import api
from app.api.utils.include.user_info import User
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.notification import Notification
from ...mine.models.mine import Mine


class MineNotificationResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'mine_guid': 'Mine guid.'})
    @requires_role_mine_view
    def get(self):
        user_name = User().get_user_username()
        mine_query = Mine.query.filter_by( deleted_ind=False ).join(Notification).filter_by(idir=user_name)
        sort_criteria = [{'model': 'Mine', 'field': 'mine_name', 'direction': 'asc'}]
        mine_query = apply_sort(mine_query, sort_criteria)
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
                return {
                    'mine_guid': str(mine_subscription.mine_guid),
                }
            except Exception:
                return self.create_error_payload(422, 'Invalid Mine guid'), 422
        else:
            return self.create_error_payload(400, 'Mine guid expected'), 400

    @api.doc(params={'mine_guid': 'Mine guid.'})
    @requires_role_mine_view
    def delete(self, mine_guid=None):
        if mine_guid:
            try:
                deleted_mine_subscription = Notification.delete_subscription(mine_guid)
                return {
                    'mine_guid': str(deleted_mine_subscription.mine_guid),
                }
            except Exception:
                return self.create_error_payload(422, 'Invalid Mine guid'), 422
        else:
            return self.create_error_payload(400, 'Mine guid expected'), 400
