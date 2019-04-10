from flask_restplus import Resource, fields
from sqlalchemy_filters import apply_sort

from app.extensions import api
from app.api.utils.include.user_info import User
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....utils.access_decorators import (requires_any_of,
                                         MINE_VIEW,
                                         MINE_CREATE,
                                         MINESPACE_PROPONENT)
from ..models.notification import Notification
from ...mine.models.mine import Mine
# todo wait for justins change to get pulled in
# from ...mine_api_models.py import MINES

class MineNotificationResource(Resource, UserMixin, ErrorMixin):
    # @api.doc(
    #     description=
    #     'Get a list of all variances for a given mine.',
    #     params={
    #         'mine_guid': 'guid of the mine for which to fetch variances'
    #     }
    # )
    # @requires_any_of([MINE_VIEW])
    # @api.marshal_with(variance_model, code=200, envelope='records')


    # subscriptions_model = api.model('Notification', {
    #     'mines': list(map(lambda x: x.json_for_list(), mines)),
    # })
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


    @api.doc(
        description=
        'Get a list of all mines subscribed to by a user.'
    )
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(MINES, code=200, envelope='records')
    def get(self):
        user_name = User().get_user_username()
        mine_query = Mine.query.filter_by( deleted_ind=False ).join(Notification).filter_by(idir=user_name)
        sort_criteria = [{'model': 'Mine', 'field': 'mine_name', 'direction': 'asc'}]
        mine_query = apply_sort(mine_query, sort_criteria)
        mines = mine_query.all()
        return {
            'mines': list(map(lambda x: x.json_for_list(), mines)),
        }
#
#
# # TODO: must bring in line with new standards
#     @api.doc(params={'mine_guid': 'Mine guid.'})
#     @requires_role_mine_view
#     def post(self, mine_guid=None):
#         if not mine_guid:
#             return self.create_error_payload(400, 'Mine guid expected'), 400
#
#         try:
#             mine_subscription = Notification.create_subscription(mine_guid)
#             return {
#                 'mine_guid': str(mine_subscription.mine_guid),
#             }
#         except Exception:
#             return self.create_error_payload(422, 'Invalid Mine guid'), 422
#
#     @api.doc(params={'mine_guid': 'Mine guid.'})
#     @requires_role_mine_view
#     def delete(self, mine_guid=None):
#         if not mine_guid:
#             return self.create_error_payload(400, 'Mine guid expected'), 400
#
#         try:
#             deleted_mine_subscription = Notification.delete_subscription(mine_guid)
#             return {
#                 'mine_guid': str(deleted_mine_subscription.mine_guid),
#             }
#         except Exception:
#             return self.create_error_payload(422, 'Invalid Mine guid'), 422

