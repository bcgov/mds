from app.api.services.email_service import EmailService
from flask_restx import Resource
from flask import request

from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL)
from app.api.utils.resources_mixins import UserMixin
from app.api.exception.mds_core_api_exceptions import MDSCoreAPIException
from app.config import Config
from datetime import datetime
from app.api.utils.include.user_info import User
from app.api.constants import MDS_EMAIL
from flask.globals import current_app

class ReportErrorResource(Resource, UserMixin):

    @requires_any_of([VIEW_ALL])
    def post(self):
        try:
            data = request.get_json()
            business_error = data.get('business_error', '')
            trace_id = data.get('trace_id', '')

            user_raw_info = User().get_user_raw_info()
            reporter_name = user_raw_info.get('given_name', '') + " " + user_raw_info.get('family_name', '')
            reporter_email = User().get_user_email()
            environment = Config.ENVIRONMENT_NAME.upper()

            reported_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            email_title = "[ERROR_REPORT] [" + environment + "] - " + reported_date + " - " + business_error
            kibana_link = f'{Config.KIBANA_BASE_URL}/app/kibana#/discover?_g=()&_a=(query:(language:kuery,query:%22trace_id%3D{trace_id}%22))'

            email_body = open("app/templates/email/report_error/error_report_email.html", "r").read()
            email_context = {
                    "reporter": {
                        "name": reporter_name,
                        "email": reporter_email
                    },
                    "reported_date": reported_date,
                    "environment": environment,
                    "business_error": business_error,
                    "trace_id": trace_id,
                    "kibana_link": kibana_link
                }
            recipients = [MDS_EMAIL]
            EmailService.send_template_email(email_title, recipients, email_body, email_context)

        except Exception as e:
            current_app.logger.error(e)
            raise MDSCoreAPIException("Error in sending email")

        return True, 201
