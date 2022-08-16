from flask_restplus import Namespace

from app.api.activity.resource.activities_mark_as_read import ActivityMarkAsReadResource
from app.api.activity.resource.activity_list import ActivityListResource

api = Namespace('activities', description='activities')

api.add_resource(ActivityListResource, '')
api.add_resource(ActivityMarkAsReadResource, '/mark-as-read')
