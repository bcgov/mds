from flask_restx import Resource, fields
from sqlalchemy_filters import apply_sort
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api, db
from app.api.utils.include.user_info import User
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL)

from app.api.mines.mine.models.mine import Mine
from app.api.mines.subscription.models.subscription import Subscription
from app.api.mines.response_models import MINES_MODEL

MINE_GUID_MODEL = api.model('mine_guid', {
    'mine_guid': fields.String,
})


class MineSubscriptionListResource(Resource, UserMixin):
    @api.doc(description='Get a list of all mines subscribed to by a user.')
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(MINES_MODEL, code=200, envelope='mines')
    def get(self):
        user_name = User().get_user_username()
        mine_query = Mine.query.filter_by(deleted_ind=False).join(Subscription).filter_by(
            user_name=user_name)
        sort_criteria = [{'model': 'Mine', 'field': 'mine_name', 'direction': 'asc'}]
        mine_query = apply_sort(mine_query, sort_criteria)
        mines = mine_query.all()
        return mines


class MineSubscriptionResource(Resource, UserMixin):
    @api.doc(description='Adds a mine to the subscriptions of the user that sends the request',
             params={'mine_guid': 'Mine guid.'})
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(MINE_GUID_MODEL, code=200)
    def post(self, mine_guid):
        if Subscription.find_subscription_for_current_user_by_id(mine_guid):
            raise BadRequest('Already subscribed to mine.')
        mine_subscription = Subscription.create_for_current_user(mine_guid)
        mine_subscription.save()
        return mine_subscription

    @api.doc(description='Removes a mine from the subscriptions of the user that sends the request',
             params={'mine_guid': 'Mine guid.'})
    @requires_any_of([VIEW_ALL])
    def delete(self, mine_guid):
        subscription_to_delete = Subscription.find_subscription_for_current_user_by_id(mine_guid)
        if not subscription_to_delete:
            raise NotFound("Subscription not found")
        db.session.delete(subscription_to_delete)
        db.session.commit()
        return '', 204
