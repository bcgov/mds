import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class CoreActivitySubscriptionView(Base):
    __tablename__ = "core_activity_subscription_view"

    core_user_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('core_user.core_user_guid'),
        primary_key=True,
    )
    target_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    target_title = db.Column(db.String)
    core_activity_object_type_code = db.Column(
        db.String,
        db.ForeignKey('core_activity_object_type.core_activity_object_type_code'),
        nullable=False)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.core_user_guid} {self.target_guid} {self.target_title}>'