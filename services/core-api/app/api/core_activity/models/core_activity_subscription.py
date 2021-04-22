import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class CoreActivitySubscription(Base, AuditMixin):
    __tablename__ = "core_activity_subscription"

    core_user_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('core_user.core_user_guid'),
        primary_key=True,
    )
    target_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    core_activity_object_type_code = db.Column(
        db.String,
        db.ForeignKey('core_activity_object_type.core_activity_object_type_code'),
        nullable=False)

    @validates('core_user_guid')
    def validate_core_user_guid(self, key, core_user_guid):
        if not core_user_guid:
            raise AssertionError('No core_user_guid provided.')
        return core_user_guid

    @validates('target_guid')
    def validate_target_guid(self, key, target_guid):
        if not target_guid:
            raise AssertionError('No target_guid provided.')
        return target_guid

    @validates('core_activity_object_type_code')
    def validate_core_activity_object_type_code(self, key, core_activity_object_type_code):
        if not core_activity_object_type_code:
            raise AssertionError('No core_activity_object_type_code provided.')
        return core_activity_object_type_code

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.core_user_guid} {self.target_guid}>'
