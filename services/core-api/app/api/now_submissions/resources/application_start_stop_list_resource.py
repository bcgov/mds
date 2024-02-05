from flask_restx import Resource
from flask import request, current_app
from sqlalchemy import desc, func, or_
from marshmallow.exceptions import MarshmallowError
from werkzeug.exceptions import BadRequest

from app.extensions import api
from app.api.now_submissions.models.application_start_stop import ApplicationStartStop
from app.api.now_submissions.response_models import APPLICATIONSTARTSTOP
from app.api.utils.access_decorators import requires_role_edit_submissions
from app.api.utils.resources_mixins import UserMixin


class ApplicationStartStopListResource(Resource, UserMixin):
    @api.doc(description='Save an application start stop')
    @requires_role_edit_submissions
    @api.expect(APPLICATIONSTARTSTOP)
    def post(self):
        
        application_startstop = ApplicationStartStop.create(str(request.json))
        application_startstop.save()

        return application_startstop.messageid, 201
