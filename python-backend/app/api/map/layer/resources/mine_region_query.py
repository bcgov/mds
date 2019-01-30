import requests
from flask import request, Response
from flask_restplus import Resource
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin


class MineRegionQueryResource(Resource, UserMixin, ErrorMixin):
    #@api.doc(params={'mine_status_guid': 'Mine status guid.'})
    #@requires_role_mine_view
    def get(self):
        proxy_response = requests.get(
            'http://maps.gov.bc.ca/arcserver/rest/services/mpcm/bcgwago/mapserver/465/query',
            params=request.args,
            headers={key: value
                     for (key, value) in request.headers if key != 'Host'},
            data=request.get_data(),
            cookies=request.cookies)

        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        headers = [(name, value) for (name, value) in proxy_response.raw.headers.items()
                   if name.lower() not in excluded_headers]

        response = Response(proxy_response.content, proxy_response.status_code, headers)
        return response
