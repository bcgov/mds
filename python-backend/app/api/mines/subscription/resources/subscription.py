from flask_restplus import Resource, fields
from sqlalchemy_filters import apply_sort
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from app.api.utils.include.user_info import User
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....utils.access_decorators import (requires_any_of,
                                         MINE_VIEW)
from ..models.subscription import Subscription
from ...mine.models.mine import Mine
from ...mine_api_models import MINES_MODEL
from app.extensions import db


class MineSubscriptionGetAllResource(Resource, UserMixin, ErrorMixin):

    MINE_GUID = api.model(
        'mine_guid', {
            'mine_guid': fields.String,
        })

    @api.doc(
        description=
        'Get a list of all mines subscribed to by a user.'
    )
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(MINES_MODEL, code=200, envelope='mines')
    def get(self):
        user_name = User().get_user_username()
        mine_query = Mine.query.filter_by( deleted_ind=False ).join(Subscription).filter_by(idir=user_name)
        sort_criteria = [{'model': 'Mine', 'field': 'mine_name', 'direction': 'asc'}]
        mine_query = apply_sort(mine_query, sort_criteria)
        mines = mine_query.all()
        return mines


class MineSubscriptionResource(Resource, UserMixin, ErrorMixin):
    MINE_GUID = api.model(
        'mine_guid', {
            'mine_guid': fields.String,
        })

    @api.doc(
        description='Adds a mine to the subscriptions of the user that sends the request',
        params={'mine_guid': 'Mine guid.'})
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(MINE_GUID, code=200)
    def post(self, mine_guid):
        if Subscription.find_subscription(mine_guid):
            raise BadRequest('Already subscribed to mine.')
        mine_subscription = Subscription.create_subscription(mine_guid)
        return {
            'mine_guid': mine_subscription.mine_guid,
        }

    @api.doc(
        description='Removes a mine from the subscriptions of the user that sends the request',
        params={'mine_guid': 'Mine guid.'})
    @requires_any_of([MINE_VIEW])
    def delete(self, mine_guid):
        subscription_to_delete = Subscription.find_subscription(mine_guid)
        if not subscription_to_delete:
            raise NotFound("Subscription not found")
        db.session.delete(subscription_to_delete)
        db.session.commit()
        return '', 204

