import enum

from sqlalchemy import desc, or_, func
from app.extensions import db

from app.api.core_activity.models.core_activity_object_type import CoreActivityObjectType
from app.api.core_activity.models.core_activity_verb import CoreActivityVerb
from app.api.core_activity.models.core_activity import CoreActivity

class Verbs(enum.Enum):
   added = "ADD"
   modified = "MOD"
   deleted = "DEL"
   assigned = "ASN"

class Objects(enum.Enum):
   user = "USR"
   report = "CRR"
   mine = "MIN"
   now = "NOW"
   party = "PTY"

class CoreActivityEngine(object):

    def get_username():
        from app import auth
        core_user = auth.get_core_user()
        return core_user.idir_user_detail.username

    def process(
        verb, 
        title, 
        object_guid, 
        object_type, 
        target_guid, 
        target_type):

        from app import auth
        core_user = auth.get_core_user()
        user_guid = core_user.core_user_guid

        new_activity = CoreActivity(
            core_activity_verb_code=verb.value,
            title=title,
            actor_guid=user_guid,
            actor_object_type_code=Objects.user.value,
            object_guid=object_guid,
            object_object_type_code=object_type.value,
            target_guid=target_guid,
            target_object_type_code=target_type.value,
            )
        new_activity.save()
        return new_activity

    def get(published_since, published_before):
            
        def generate_link(core_activity):
            if core_activity.target_object_type_code == "MIN":
                return f"/mine-dashboard/{core_activity.target_guid}"
            if core_activity.target_object_type_code == "CRR":
                return f"/mine-dashboard/{core_activity.object_guid}/reports"
            if core_activity.target_object_type_code == "NOW":
                return f"/dashboard/notice-of-work/application/{core_activity.target_guid}"
            else:
                return f"/"                
                
        core_activities_query = CoreActivity.query.filter(CoreActivity.published_date >= published_since)

        if published_before:
            core_activities_query = core_activities_query.filter(CoreActivity.published_date < published_since)
            
        core_activities = core_activities_query.order_by(CoreActivity.published_date.desc()).all()

        for core_activity in core_activities:
            core_activity.link = generate_link(core_activity)
        
        return core_activities
