from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from flask import Flask
from flask import Response
from flask import stream_with_context
import requests
from flask import request

from app.extensions import api
from app.api.now_submissions.models.application import Application
from app.api.now_submissions.response_models import APPLICATION
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin, ErrorMixin


class ApplicationDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(description='Fetch an application document by id', params={})
    #@requires_role_view_all
    #@api.marshal_with(APPLICATION, code=200)
    def get(self, application_guid, id):
        #application = Application.find_by_application_guid(application_guid)
        #if not application:
        #    raise NotFound('Application not found')
        url = 'http://ipv4.download.thinkbroadband.com/10MB.zip'
        filename = url.rsplit('/', 1)[1]
        req = requests.get(url, stream=True)
        resp = Response(
            stream_with_context(req.iter_content(chunk_size=1024)), headers=req.raw.headers.items())
        resp.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
        return resp
        #return "pong"
