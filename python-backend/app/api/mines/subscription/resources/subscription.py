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
# todo wait for justins change to get pulled in
# from ...mine_api_models.py import MINES


class MineSubscriptionGetAllResource(Resource, UserMixin, ErrorMixin):

    # todo delete bellow when done
    MINE_GUID = api.model(
        'mine_guid', {
            'mine_guid': fields.String,
        })
    MINE_TSF = api.model(
        'MineTailingsStorageFacility', {
            'mine_tailings_storage_facility_guid': fields.String,
            'mine_guid': fields.String,
            'mine_tailings_storage_facility_name': fields.String,
        })
    MINE_TYPE_DETAIL = api.model(
        'MineTypeDetail', {
            'mine_type_detail_xref_guid': fields.String,
            'mine_type_guid': fields.String,
            'mine_disturbance_code': fields.String,
            'mine_commodity_code': fields.String,
        })

    MINE_TYPE = api.model(
        'MineType', {
            'mine_type_guid': fields.String,
            'mine_guid': fields.String,
            'mine_tenure_type_code': fields.String,
            'mine_type_detail': fields.List(fields.Nested(MINE_TYPE_DETAIL)),
        })

    MINE_VERIFIED = api.model(
        'MineVerifiedStatus', {
            'mine_guid': fields.String,
            'mine_name': fields.String,
            'healthy_ind': fields.Boolean,
            'verifying_user': fields.String,
            'verifying_timestamp': fields.Date,
        })
    PERMIT = api.model('MinePermit', {
        'permit_guid': fields.String,
        'permit_no': fields.String,
    })
    STATUS = api.model(
        'MineStatus', {
            'mine_status_guid': fields.String,
            'mine_guid': fields.String,
            'mine_status_xref_guid': fields.String,
            'status_values': fields.List(fields.String()),
            'status_labels': fields.List(fields.String),
            'effective_date': fields.Date,
            'expiry_date': fields.Date,
        })
    MINES = api.model(
        'Mines', {
            'mine_guid': fields.String,
            'mine_name': fields.String,
            'mine_no': fields.String,
            'mine_note': fields.String,
            'major_mine_ind': fields.Boolean,
            'mine_region': fields.String,
            'mine_permit': fields.List(fields.Nested(PERMIT)),
            'mine_status': fields.List(fields.Nested(STATUS)),
            'mine_tailings_storage_facilities': fields.List(fields.Nested(MINE_TSF)),
            'mine_type': fields.List(fields.Nested(MINE_TYPE)),
            'verified_status': fields.Nested(MINE_VERIFIED)
        })
    # todo delete above when done



    @api.doc(
        description=
        'Get a list of all mines subscribed to by a user.'
    )
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(MINES, code=200, envelope='mines')
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