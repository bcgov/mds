from flask_restplus import Namespace

from app.api.core_activity.resources.core_activity import CoreActivityListResource

api = Namespace('core_activity', description='Core Activity operations')

api.add_resource(CoreActivityListResource, '')
