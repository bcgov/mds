from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base


class PermitConditionTag(AuditMixin, Base):
    __tablename__ = 'permit_condition_tag'
    permit_condition_tag_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    description = db.Column(db.String, nullable=False)

    @classmethod
    def get_all(cls):
        return cls.query.all()
