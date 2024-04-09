from flask_restx import Namespace

from app.api.reporting.resources.metabase import MetabaseDashboardResource

api = Namespace('reporting', description='Authenticated reports')

api.add_resource(MetabaseDashboardResource, '/<string:type>/<int:id>')
