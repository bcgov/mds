from flask_restplus import Namespace

from ..resources.metabase import CoreDashboardResource

api = Namespace('reporting', description='Authenticated reports')

api.add_resource(CoreDashboardResource, '/core-dashboard')
