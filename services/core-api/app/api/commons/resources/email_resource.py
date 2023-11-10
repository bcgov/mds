from app.api.services.email_service import EmailService
from flask_restplus import Resource
from flask import request

from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL)
from app.api.utils.resources_mixins import UserMixin
from app.api.exception.mds_exceptions import MDSCoreAPIException

class EmailResource(Resource, UserMixin):

    @requires_any_of([VIEW_ALL])
    def post(self):
        try:
            data = request.get_json()
            # Extract title and body from the JSON data
            title = data.get('title', '')
            body = data.get('body', '')
            recipients = data.get("recipients")
            
            EmailService.send_email(title, recipients, body)
            
        except Exception as e:
            raise MDSCoreAPIException("Error in sending email", e)

        return True, 201
