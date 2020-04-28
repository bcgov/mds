import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.core_activity.models.core_activity_object_type import CoreActivityObjectType
from app.api.core_activity.models.core_activity_verb import CoreActivityVerb

class CoreActivity(Base):
    __tablename__ = "core_activity"

    core_activity_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    core_activity_verb_code = db.Column(db.String, db.ForeignKey('core_activity_verb.core_activity_verb_code'))
    published_date = db.Column(db.DateTime, server_default=FetchedValue())
    title = db.Column(db.String)
    actor_id = db.Column(db.Integer)
    actor_object_type_code = db.Column(db.String, db.ForeignKey('core_activity_object_type.core_activity_object_type_code'))
    object_id = db.Column(db.Integer)
    object_object_type_code = db.Column(db.String, db.ForeignKey('core_activity_object_type.core_activity_object_type_code'))
    target_id = db.Column(db.Integer)
    target_object_type_code = db.Column(db.String, db.ForeignKey('core_activity_object_type.core_activity_object_type_code'))

    def __repr__(self):
        return '<CoreActivity %r>' % self.core_activity_id
