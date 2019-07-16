import jwt

from flask_restplus import Resource
from flask import request, current_app

from app.extensions import db, api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.search import search_targets, append_result, execute_search, SearchResult
from app.api.search.search_api_models import SEARCH_RESULT_RETURN_MODEL


class Metabase():
  @classmethod
  def get_dashboard_url(cls, id):
    payload = {
      "resource": {"dashboard": id},
      "params": {}
    }
    token = jwt.encode(payload, current_app.config['METABASE_EMBEDDING_SECRET_KEY'], algorithm="HS256")

    return current_app.config['METABASE_SITE_URL'] + "/embed/dashboard/" + token.decode("utf8") 

class CoreDashboardResource(Resource, UserMixin):
    @requires_role_view_all
    def get(self):
      dashboard_url = Metabase.get_dashboard_url(136)
      return { 'dashboard_url': dashboard_url }

class LandingPageGraphOneResource(Resource, UserMixin):
    @requires_role_view_all
    def get(self):
      dashboard_url = Metabase.get_dashboard_url(164)
      return { 'dashboard_url': dashboard_url }

class LandingPageGraphTwoResource(Resource, UserMixin):
    @requires_role_view_all
    def get(self):
      dashboard_url = Metabase.get_dashboard_url(165)
      return { 'dashboard_url': dashboard_url }

