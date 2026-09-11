from app.api.services.email_service import EmailService
from flask_restx import Resource
from flask import request
from markupsafe import Markup, escape
from urllib.parse import quote

from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL)
from app.api.utils.resources_mixins import UserMixin
from app.api.exception.mds_core_api_exceptions import MDSCoreAPIException
from app.config import Config
from datetime import datetime
from app.api.utils.include.user_info import User
from app.api.constants import MDS_EMAIL
from flask.globals import current_app
from app import auth

SEEN_BEFORE_LABELS = {
    True: "Yes",
    False: "No",
    None: "Not sure",
}


def _build_observe_logs_link(trace_id):
    log_query = (
        '{ kubernetes_namespace_name="' + Config.OPENSHIFT_NAMESPACE + '", '
        'kubernetes_labels_app="core-api", kubernetes_container_name="app" }'
    )
    if trace_id:
        log_query += f' |= "trace_id={trace_id}"'
    log_query += ' | json'
    return (f'{Config.OBSERVE_LOGS_BASE_URL}/dev-monitoring/ns/{Config.OPENSHIFT_NAMESPACE}/logs'
            f'?q={quote(log_query)}&showResources=0')


class ReportErrorResource(Resource, UserMixin):

    @requires_any_of([VIEW_ALL])
    def post(self):
        try:
            data = request.get_json()
            business_error = data.get('business_error', '')
            trace_id = data.get('trace_id', '')
            severity = data.get('severity') or 'Low'
            description = data.get('description', '')
            seen_before = data.get('seen_before')

            user_raw_info = User().get_user_raw_info()
            reporter_name = user_raw_info.get('given_name', '') + " " + user_raw_info.get('family_name', '')
            reporter_email = User().get_user_email()
            environment = Config.ENVIRONMENT_NAME.upper()

            reported_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            email_title = (
                f"[ERROR_REPORT] [{severity.upper()}] [{environment}] - {reported_date} - {business_error}")
            observe_logs_link = _build_observe_logs_link(trace_id)

            if auth.get_user_is_proponent():
                template_path = "email/report_error/ms_error_report_email.html"
            else:
                template_path = "email/report_error/core_error_report_email.html"

            formatted_description = Markup(str(escape(description)).replace('\n', '<br />'))

            email_context = {
                    "reporter": {
                        "name": reporter_name,
                        "email": reporter_email
                    },
                    "reported_date": reported_date,
                    "environment": environment,
                    "business_error": business_error,
                    "trace_id": trace_id,
                    "severity": severity,
                    "description": formatted_description,
                    "seen_before": SEEN_BEFORE_LABELS.get(seen_before, "Not sure"),
                    "observe_logs_link": observe_logs_link
                }
            recipients = [MDS_EMAIL]
            EmailService.send_template_email(email_title, recipients, template_path, email_context)

        except Exception as e:
            current_app.logger.error(e)
            raise MDSCoreAPIException("Error in sending email")

        return True, 201
