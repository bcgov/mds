from flask_restplus import Resource, inputs
from werkzeug.exceptions import NotFound, BadRequest
from datetime import timedelta
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import api
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit, requires_role_mine_admin

from app.api.mines.mine.models.mine import Mine
from app.api.mines.alerts.models.mine_alert import MineAlert

from app.api.mines.response_models import MINE_ALERT_MODEL

EXCLUSION_CONSTRAINT_MINE_GUID_DATE_RANGE_MESSAGE = 'violates exclusion constraint "mine_guid_date_range_uniq"'


class MineAlertListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('start_date', type=lambda x: inputs.datetime_from_iso8601(x), store_missing=False, required=True)
    parser.add_argument('contact_name', type=str, store_missing=False, required=True)
    parser.add_argument('contact_phone', type=str, store_missing=False, required=True)
    parser.add_argument('message', type=str, store_missing=False, required=True)

    parser.add_argument('end_date', type=lambda x: inputs.datetime_from_iso8601(x) if x else None, required=False)

    @api.doc(description='Retrive a list of alerts for a mine')
    @api.marshal_with(MINE_ALERT_MODEL, envelope='records', code=200)
    @requires_role_view_all
    def get(self, mine_guid):

        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found')

        return mine.alerts, 200

    @api.expect(MINE_ALERT_MODEL)
    @api.doc(description='Create a new alert for a mine')
    @api.marshal_with(MINE_ALERT_MODEL, code=201)
    @requires_role_view_all
    def post(self, mine_guid):

        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()
        start_date = data.get('start_date')
        active_alert = MineAlert.find_active_alert_by_mine_guid(mine_guid)
        mine_has_active_alert = active_alert is not None
        active_alert_indefinite = mine_has_active_alert and active_alert.end_date is None
        all_mine_alerts = MineAlert.find_by_mine_guid(mine_guid)
        historic_alerts = [_alert for _alert in all_mine_alerts if _alert.start_date >= data.get('start_date')]

        if len(historic_alerts) > 0:
            raise BadRequest('Start date cannot come before a historic alert. Please check history for more details.')

        try:
            if active_alert_indefinite:
                active_alert.end_date = start_date - timedelta(seconds=1)
                active_alert.is_active = False
                active_alert.save()

            mine_alert = MineAlert.create(
                mine=mine,
                start_date=data.get('start_date'),
                end_date=data.get('end_date'),
                contact_name=data.get('contact_name'),
                contact_phone=data.get('contact_phone'),
                message=data.get('message')
            )

            mine_alert.save()

            return mine_alert, 201
        except SQLAlchemyError as ex:
            if EXCLUSION_CONSTRAINT_MINE_GUID_DATE_RANGE_MESSAGE in str(ex):
                raise BadRequest('Start/end date cannot overlap with an existing alert on this mine. Please check history for more details.')
            raise ex


class MineAlertResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('start_date', type=lambda x: inputs.datetime_from_iso8601(x), store_missing=False, required=True)
    parser.add_argument('contact_name', type=str, store_missing=False, required=True)
    parser.add_argument('contact_phone', type=str, store_missing=False, required=True)
    parser.add_argument('message', type=str, store_missing=False, required=True)

    parser.add_argument('end_date', type=lambda x: inputs.datetime_from_iso8601(x) if x else None, required=False)

    @api.doc(
        description='Retrieve a mine alert by guid',
        params={'mine_alert_guid': 'Guid of the mine alert to retrieve.'})
    @api.marshal_with(MINE_ALERT_MODEL, code=200)
    @requires_role_view_all
    def get(self, mine_guid, mine_alert_guid):
        alert = MineAlert.find_by_guid(mine_alert_guid)

        if not alert:
            raise NotFound('Mine alert with guid "{mine_alert_guid}" not found.')

        return alert, 200

    @api.doc(
        description='Update a mine alert by guid',
        params={'mine_alert_guid': 'Guid of the mine alert to delete.'})
    @api.marshal_with(MINE_ALERT_MODEL, code=200)
    @requires_role_mine_edit
    def put(self, mine_guid, mine_alert_guid):
        alert = MineAlert.find_by_guid(mine_alert_guid)
        data = self.parser.parse_args()
        all_mine_alerts = MineAlert.find_by_mine_guid(mine_guid)
        historic_alerts = [_alert for _alert in all_mine_alerts if (str(_alert.mine_alert_guid) != mine_alert_guid and data.get('start_date') >= _alert.start_date)]

        if not alert:
            raise NotFound('Mine alert with guid "{mine_alert_guid}" not found.')
        if not alert.is_active:
            raise BadRequest('Cannot update an inactive alert.')
        if len(historic_alerts) > 0:
            raise BadRequest('Start date cannot come before a historic alert. Please check history for more details.')

        try:
            alert.update(data.get('start_date'), data.get('end_date'), data.get('contact_name'), data.get('contact_phone'), data.get('message'))
            alert.save()

            return alert, 200
        except SQLAlchemyError as ex:
            if EXCLUSION_CONSTRAINT_MINE_GUID_DATE_RANGE_MESSAGE in str(ex):
                raise BadRequest('Start/end date cannot overlap with an existing alert on this mine. Please check history for more details.')
            raise ex

    @ api.doc(
        description='Delete a mine alert by guid',
        params={'mine_alert_guid': 'Guid of the mine alert to delete.'})
    @ requires_role_mine_admin
    def delete(self, mine_guid, mine_alert_guid):
        alert = MineAlert.find_by_guid(mine_alert_guid)
        if not alert:
            raise NotFound('Mine alert with guid "{mine_alert_guid}" not found.')

        alert.deleted_ind = True
        alert.save()

        return ('', 204)
