from flask_restplus import Namespace

from .resources.metabase import MetabaseDashboardResource

api = Namespace('reporting', description='Authenticated reports')

api.add_resource(MetabaseDashboardResource, '/dashboard/<int:id>')
