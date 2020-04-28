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

class Objects(enum.Enum):
   user = "USR"
   report = "CRR"
   mine = "MIN"

class CoreActivityEngine(object):

    def get_username():
        from app import auth
        core_user = auth.get_core_user()
        return core_user.idir_user_detail.username

    def process(
        verb, 
        title, 
        object_id, 
        object_type, 
        target_id, 
        target_type):

        from app import auth
        core_user = auth.get_core_user()
        user_id = core_user.core_user_id

        new_activity = CoreActivity(
            core_activity_verb_code=verb.value,
            title=title,
            actor_id=user_id,
            actor_object_type_code=Objects.user.value,
            object_id=object_id,
            object_object_type_code=object_type.value,
            target_id=target_id,
            target_object_type_code=target_type.value,
            )
        new_activity.save()
        return new_activity