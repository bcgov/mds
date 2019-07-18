from flask_restplus import Namespace

from ..resources.metabase import CoreDashboardResource, LandingPageGraphOneResource, LandingPageGraphTwoResource

api = Namespace('reporting', description='Authenticated reports')

api.add_resource(CoreDashboardResource, '/dashboard-136')
api.add_resource(LandingPageGraphOneResource, '/dashboard-164')
api.add_resource(LandingPageGraphTwoResource, '/dashboard-165')
