import jwt

from flask_restplus import Resource
from flask import request, current_app

from app.extensions import db, api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin 
from app.api.utils.search import search_targets, append_result, execute_search, SearchResult
from app.api.search.response_models import SEARCH_RESULT_RETURN_MODEL


class MetabaseDashboardResource(Resource, UserMixin):
    def get(self, id):
        payload = {"resource": {"dashboard": id}, "params": {}}
        token = jwt.encode(payload,
                           current_app.config['METABASE_EMBEDDING_SECRET_KEY'],
                           algorithm="HS256")

        dashboard_url = current_app.config[
            'METABASE_SITE_URL'] + "/embed/dashboard/" + token.decode("utf8")
        return {'dashboard_url': dashboard_url}
