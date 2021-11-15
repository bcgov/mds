import dateutil.parser
from datetime import datetime, timezone
from flask import request, current_app
from datetime import datetime
from dateutil.tz import UTC

from sqlalchemy.orm import validates
from app.extensions import api
from app.api.utils.access_decorators import requires_role_edit_permit, can_edit_now_dates
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_progress import NOWApplicationProgress
from flask_restplus import Resource, reqparse
from app.api.utils.resources_mixins import UserMixin
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
from app.api.now_applications.response_models import NOW_APPLICATION_PROGRESS


class NOWApplicationProgressResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    # parser.add_argument(
    #     'end_date', help='The date when that stage of NOW processing was complete', location='json')
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

    @api.doc(
        description=
        'Track progress of a Notice of Work application as it moves through its stages, track who progressed the application and when.'
    )
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_PROGRESS, code=201)
    def post(self, application_guid, application_progress_status_code):
        identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if identity.now_application is None:
            raise NotFound('Notice of Work not found')

        existing_now_progress = next(
            (p for p in identity.now_application.application_progress
             if p.application_progress_status_code == application_progress_status_code), None)

        now_progress = None
        if existing_now_progress:
            #RE Open existing date span - starting at original start time
            existing_now_progress.end_date = None
            now_progress = existing_now_progress
        else:
            #Create new datespan - starting now
            new_now_progress = NOWApplicationProgress.create(identity.now_application,
                                                             application_progress_status_code)
            now_progress = new_now_progress

        if identity.now_application.now_application_status_code != "REF" and application_progress_status_code in [
                "REF", "CON", "PUB"
        ]:
            identity.now_application.previous_application_status_code = identity.now_application.now_application_status_code
            identity.now_application.now_application_status_code = "REF"
        identity.save()

        try:
            now_progress.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return now_progress, 201

    @api.doc(
        description=
        'Track progress of a Notice of Work application as it moves through its stages, track who progressed the application and when.'
    )
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_PROGRESS, code=201)
    def put(self, application_guid, application_progress_status_code):
        current_app.logger.debug("WE'RE EDITING DATA????:")
        current_app.logger.debug(application_progress_status_code)
        data = request.json

        identity = NOWApplicationIdentity.find_by_guid(application_guid)

        if identity.now_application is None:
            raise NotFound('Notice of Work not found')

        existing_now_progress = next(
            (p for p in identity.now_application.application_progress
             if p.application_progress_status_code == application_progress_status_code), None)

        if not existing_now_progress:
            raise NotFound('This progress object has not been created yet')

        start_date = data.get("start_date", None)
        end_date = data.get("end_date", None)
        my_time = datetime.min.time()
        current_app.logger.debug(dateutil.parser.isoparse(start_date).astimezone(UTC))
        current_app.logger.debug(dateutil.parser.isoparse(end_date).astimezone(UTC))
        current_app.logger.debug(can_edit_now_dates())
        if can_edit_now_dates():
            existing_now_progress.end_date = dateutil.parser.isoparse(end_date).astimezone(UTC)
            existing_now_progress.start_date = dateutil.parser.isoparse(start_date).astimezone(UTC)
        else:
            existing_now_progress.end_date = datetime.now(tz=timezone.utc)
        existing_now_progress.save()

        # update application status if referral/consultation/Public Comment are all complete.
        # update status if only one is started and completed.
        if len(identity.now_application.application_progress) >= 1:
            progress_end_dates = [
                progress.end_date for progress in identity.now_application.application_progress
                if progress.application_progress_status_code in ["REF", "CON", "PUB"]
            ]

            if progress_end_dates and all([x is not None for x in progress_end_dates]):
                identity.now_application.previous_application_status_code = identity.now_application.now_application_status_code
                identity.now_application.now_application_status_code = "RCO"
                identity.save()

        if application_progress_status_code == 'REV':
            identity.now_application.add_now_form_to_fap(
                "This document was automatically created when Technical Review was completed.")

        return existing_now_progress, 200