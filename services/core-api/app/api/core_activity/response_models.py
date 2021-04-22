from app.extensions import api
from flask_restplus import fields

CORE_ACTIVITY = api.model(
    'CoreActivity', {
        'core_activity_id': fields.Integer,
        'published_date': fields.Date,
        'core_activity_verb_code': fields.String,
        'title': fields.String,
        'link': fields.String,
        'actor_guid': fields.String,
        'actor_object_type_code': fields.String,
        'object_guid': fields.String,
        'object_object_type_code': fields.String,
        'target_guid': fields.String,
        'target_object_type_code': fields.String,
    })

CORE_ACTIVITY_OBJECT_TYPE = api.model(
    'CoreActivityObjectType', {
        'core_activity_object_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
    })

CORE_ACTIVITY_SUBSCRIPTION = api.model('CoreActivitySubscription', {
    'target_guid': fields.String,
    'core_activity_object_type_code': fields.String
})

CORE_ACTIVITY_SUBSCRIPTION_VIEW = api.inherit('CoreActivitySubscriptionView',
                                              CORE_ACTIVITY_SUBSCRIPTION,
                                              {'target_title': fields.String})
