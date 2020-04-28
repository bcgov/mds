import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.core_activity.models.core_activity_object_type import CoreActivityObjectType
from app.api.core_activity.models.core_activity_verb import CoreActivityVerb

##########################################################################################
# For performance reasons, DO NOT add any relationships here to unrelated models. If 
# needed, add new properties or tables (more or less) conforming to the W3 Activity 
# Stream specification or request related details via other APIs when needed:
#
# https://activitystrea.ms/specs/json/1.0/#examples
#
###########################################################################################

class CoreActivity(Base):
    __tablename__ = "core_activity"

    core_activity_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    core_activity_verb_code = db.Column(db.String, db.ForeignKey('core_activity_verb.core_activity_verb_code'))
    published_date = db.Column(db.DateTime, server_default=FetchedValue())
    title = db.Column(db.String)
    actor_guid = db.Column(UUID(as_uuid=True))
    actor_object_type_code = db.Column(db.String, db.ForeignKey('core_activity_object_type.core_activity_object_type_code'))
    object_guid = db.Column(UUID(as_uuid=True))
    object_object_type_code = db.Column(db.String, db.ForeignKey('core_activity_object_type.core_activity_object_type_code'))
    target_guid = db.Column(UUID(as_uuid=True))
    target_object_type_code = db.Column(db.String, db.ForeignKey('core_activity_object_type.core_activity_object_type_code'))

    def __repr__(self):
        return '<CoreActivity %r>' % self.core_activity_id
