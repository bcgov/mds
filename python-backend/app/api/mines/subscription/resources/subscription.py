from flask_restplus import Resource, fields
from sqlalchemy_filters import apply_sort
from sqlalchemy.orm import validates

from app.extensions import api
from app.api.utils.include.user_info import User
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....utils.access_decorators import (requires_any_of,
                                         MINE_VIEW)
from ..models.subscription import Subscription
from ...mine.models.mine import Mine
from ...mine_api_models import MINES_MODEL


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
    def post(self, mine_guid=None):
        if not mine_guid:
            return self.create_error_payload(400, 'Mine guid expected'), 400

        mine_subscription = Subscription.create_subscription(mine_guid)
        return {
            'mine_guid': str(mine_subscription.mine_guid),
        }


    @api.doc(
        description='Removes a mine from the subscriptions of the user that sends the request',
        params={'mine_guid': 'Mine guid.'})
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(MINE_GUID, code=200)
    def delete(self, mine_guid=None):
        if not mine_guid:
            return self.create_error_payload(400, 'Mine guid expected'), 400

        deleted_mine_subscription = Subscription.delete_subscription(mine_guid)
        return {
            'mine_guid': str(deleted_mine_subscription.mine_guid),
        }

    @validates('mine_guid')
    def validate_mine_guid(self, key,mine_guid):
        if not mine_guid:
            raise AssertionError('Missing mine_guid')
        try:
            uuid.UUID(mine_guid, version=4)
        except ValueError:
            raise AssertionError('Invalid mine_guid')
        return mine_guid