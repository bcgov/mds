import requests
from flask import request, Response
from flask_restplus import Resource
from app.extensions import api, cache
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....constants import MINE_MAP_MINE_REGION_CACHE


class MineRegionQueryResource(Resource, UserMixin, ErrorMixin):
    #@api.doc(params={'mine_status_guid': 'Mine status guid.'})
    #@requires_role_mine_view
    def get(self):
        proxy_response_content = cache.get(MINE_MAP_MINE_REGION_CACHE + '_CONTENT_' +
                                           str(request.query_string))
        proxy_response_headers = cache.get(MINE_MAP_MINE_REGION_CACHE + '_HEADERS_' +
                                           str(request.query_string))

        if not proxy_response_content:
            proxy_response = requests.get(
                'http://maps.gov.bc.ca/arcserver/rest/services/mpcm/bcgwago/mapserver/465/query',
                params=request.args,
                headers={key: value
                         for (key, value) in request.headers if key != 'Host'},
                data=request.get_data(),
                cookies=request.cookies)

            excluded_headers = [
                'content-encoding', 'content-length', 'transfer-encoding', 'connection'
            ]
            proxy_response_headers = [(name, value)
                                      for (name, value) in proxy_response.raw.headers.items()
                                      if name.lower() not in excluded_headers]
            proxy_response_content = proxy_response.content

            if proxy_response.status_code is 200:
                cache.set(
                    MINE_MAP_MINE_REGION_CACHE + '_HEADERS_' + str(request.query_string),
                    proxy_response_headers,
                    timeout=30)
                cache.set(
                    MINE_MAP_MINE_REGION_CACHE + '_CONTENT_' + str(request.query_string),
                    proxy_response_content,
                    timeout=30)

        response = Response(proxy_response_content, 200, proxy_response_headers)
        return response
