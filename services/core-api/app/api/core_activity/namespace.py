from flask_restplus import Namespace

from app.api.core_activity.resources.core_activity import CoreActivityListResource
from app.api.core_activity.resources.core_activity_subscription import CoreActivitySubscriptionResource, CoreActivitySubscriptionListResource

api = Namespace('core_activity', description='Core Activity operations')

api.add_resource(CoreActivityListResource, '')
api.add_resource(CoreActivitySubscriptionListResource, '/subscriptions')
api.add_resource(CoreActivitySubscriptionResource, '/subscriptions/<string:target_guid>')