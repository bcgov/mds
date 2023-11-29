from app.api.services.email_service import EmailService
from flask_restplus import Resource
from flask import request

from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL)
from app.api.utils.resources_mixins import UserMixin
from app.api.exception.mds_core_api_exceptions import MDSCoreAPIException
from app.config import Config
from datetime import datetime
from app.api.utils.include.user_info import User
from app.api.constants import MDS_EMAIL

class ReportErrorResource(Resource, UserMixin):

    @requires_any_of([VIEW_ALL])
    def post(self):
        try:
            data = request.get_json()
            business_error = data.get('business_error', '')
            detailed_error = data.get('detailed_error', '')

            user_raw_info = User().get_user_raw_info()
            reporter_name = user_raw_info.get('given_name', '') + " " + user_raw_info.get('family_name', '')
            reporter_email = User().get_user_email()
            reported_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            email_title = "[MDS_INCIDENT_REPORT] [" + Config.ENVIRONMENT_NAME + "] - " + reported_date + " - " + business_error

            html_content = f"<html><body> \
              <p><strong>Reporter's Name:</strong> {reporter_name} </br>\
              <strong>Reporter's Email:</strong> {reporter_email} </br>\
              <strong>Reported Date:</strong> {reported_date}</p> \
              <p><strong>Business Error:</strong> {business_error}</p> \
              <p><strong>Detailed Error:</strong> {detailed_error}</p> \
              </body></html>"
              # ///test below email input params with template and the sending email
            email_body = open("app/templates/email/report_error/error_report_email.html", "r").read()
            email_context = {
                    "reporter": {
                        "name": reporter_name,
                        "email": reporter_email
                    },
                    "reported_date": reported_date,
                    "business_error": business_error,
                    "detailed_error": detailed_error
                }
            EmailService.send_email(email_title, MDS_EMAIL, email_body, email_context)

        except Exception as e:
            raise MDSCoreAPIException("Error in sending email", detailed_error = e)

        return True, 201
