import requests
import json

from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from flask import Flask, Response, stream_with_context, request, current_app
from requests.auth import HTTPBasicAuth

from app.extensions import api, cache
from app.api.now_submissions.models.application import Application
from app.api.now_submissions.response_models import APPLICATION
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin, ErrorMixin

from app.api.constants import NROS_TOKEN, TIMEOUT_60_MINUTES


class ApplicationDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(description='Fetch an application document by id', params={})
    #@requires_role_view_all
    #@api.marshal_with(APPLICATION, code=200)
    def get(self, application_guid, id):
        #application = Application.find_by_application_guid(application_guid)
        #if not application:
        #    raise NotFound('Application not found')

        _nros_token = cache.get(NROS_TOKEN)
        if _nros_token is None:
            _nros_client_id = current_app.config['NROS_CLIENT_ID']
            _nros_client_secret = current_app.config['NROS_CLIENT_SECRET']
            _nros_token_url = current_app.config['NROS_TOKEN_URL']

            _nros_resp = json.loads(
                requests.get(
                    _nros_token_url, auth=HTTPBasicAuth(_nros_client_id, _nros_client_secret)).text)
            _nros_token = _nros_resp["access_token"]
            cache.set(NROS_TOKEN, _nros_token, timeout=TIMEOUT_60_MINUTES)

        file_url = 'https://t1api.nrs.gov.bc.ca/dms-api/v1/files/OM8CRJNFQFSNKBW1XCKZ5G72'

        file_info = json.loads(
            requests.get(file_url, stream=True, headers={
                "Authorization": f"Bearer {_nros_token}"
            }).text)

        file_download_req = requests.get(
            f'{file_url}/content', stream=True, headers={"Authorization": f"Bearer {_nros_token}"})

        file_download_resp = Response(
            stream_with_context(file_download_req.iter_content(chunk_size=1024)),
            headers=file_download_req.raw.headers.items())
        file_download_resp.headers[
            'Content-Disposition'] = f'attachment; filename="{file_info["filename"]}"'

        return file_download_resp
