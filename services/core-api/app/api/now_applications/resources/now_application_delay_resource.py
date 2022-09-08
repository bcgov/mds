import dateutil.parser
from flask_restplus import Resource, reqparse
from flask import request, current_app
from datetime import datetime, timezone

import dateutil.parser
from dateutil.tz import UTC

from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit, can_edit_now_dates
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.api.now_applications.models.now_application_delay_type import NOWApplicationDelayType
from app.api.now_applications.models.now_application_delay import NOWApplicationDelay
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.response_models import NOW_APPLICATION_DELAY_TYPE, NOW_APPLICATION_DELAY


class NOWApplicationDelayTypeResource(Resource, UserMixin):

    @api.doc(description='Get a list of all Notice of Work Delay Reasons.', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_DELAY_TYPE, code=200, envelope='records')
    def get(self):
        return NOWApplicationDelayType.get_all()


class NOWApplicationDelayListResource(Resource, UserMixin):

    @api.doc(description='Get a list of all Notice of Work Delay Reasons.', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_DELAY, code=200, envelope='records')
    def get(self, now_application_guid):
        now_app = NOWApplicationIdentity.find_by_guid(now_application_guid)
        if not now_app:
            raise NotFound('Notice of Work Application not found')

        return now_app.application_delays

    @api.doc(description='Start a delay on a Notice of Work application', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_DELAY, code=201)
    def post(self, now_application_guid):
        now_app = NOWApplicationIdentity.find_by_guid(now_application_guid)
        if not now_app:
            raise NotFound('Notice of Work Application not found')

        # ensure no nothers are already open
        if len([d for d in now_app.application_delays if d.end_date == None]) > 0:
            raise BadRequest("Close existing 'open' delay before opening a new one")

        now_delay = NOWApplicationDelay._schema().load(request.json)
        now_delay.start_date = datetime.now(tz=timezone.utc)
        now_app.application_delays.append(now_delay)

        # update now status
        if now_app.now_application is not None:
            if now_delay.delay_type_code is not None and now_delay.delay_type_code in ("OAB",
                                                                                       "NRT"):
                now_app.now_application.previous_application_status_code = now_app.now_application.now_application_status_code
                now_app.now_application.now_application_status_code = "GVD"
            else:
                now_app.now_application.previous_application_status_code = now_app.now_application.now_application_status_code
                now_app.now_application.now_application_status_code = "CDI"

        now_app.save()
        return now_delay, 201


class NOWApplicationDelayResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'start_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%dT%H:%M:%S%z') if x else None,
        help='The date when that stage of NOW processing was started',
        location='json')
    parser.add_argument(
        'end_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%dT%H:%M:%S%z') if x else None,
        help='The date when that stage of NOW processing was complete',
        location='json')
    parser.add_argument(
        'date_override',
        type=bool,
        help='Indicates if the Progress dates are being manually edited via a secondary flow.')

    @api.doc(description='Get a list of all Notice of Work Delay Reasons.', params={})
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_DELAY, code=200, envelope='records')
    def put(self, now_application_guid, now_application_delay_guid):
        data = request.json

        def change_now_status(now_app_guid):
            now_app = NOWApplicationIdentity.find_by_guid(now_app_guid)
            if not now_app:
                raise NotFound('Notice of Work Application not found')

            # change NoW status back to previous state
            if now_app.now_application is not None:
                now_app.now_application.now_application_status_code = now_app.now_application.previous_application_status_code
            now_app.save()

        now_delay = NOWApplicationDelay._schema().load(
            request.json, instance=NOWApplicationDelay.find_by_guid(now_application_delay_guid))

        if not now_delay:
            raise NotFound('Notice of Work Application Delay not found')

        start_date = data.get("start_date", None)
        end_date = data.get("end_date", None)
        date_override = data.get("date_override", False)
        if can_edit_now_dates() and date_override:
            if start_date is not None:
                now_delay.start_date = dateutil.parser.isoparse(start_date).astimezone(UTC)
            if end_date is not None:
                if end_date < start_date:
                    raise BadRequest("The end date must be after the start date.")
                if now_delay.end_date is None:
                    change_now_status(now_application_guid)
                now_delay.end_date = dateutil.parser.isoparse(end_date).astimezone(UTC)
        else:
            now_delay.end_date = datetime.now(tz=timezone.utc)
            change_now_status(now_application_guid)
        now_delay.save()

        return now_delay
