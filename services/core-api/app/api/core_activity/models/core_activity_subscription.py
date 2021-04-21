import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class CoreActivitySubscription(Base, AuditMixin):
    __tablename__ = "core_activity_subscription"

    core_user_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    target_guid = db.Column(UUID(as_uuid=True), primary_key=True)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.core_user_guid} {self.target_guid}>'
