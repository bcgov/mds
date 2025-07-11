from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin


class PermitConditionTag(AuditMixin, Base, SoftDeleteMixin):
    __tablename__ = 'permit_condition_tag'
    permit_condition_tag_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    description = db.Column(db.String, nullable=False)

    @classmethod
    def get_all(cls):
        return cls.query.all()
    
    @classmethod
    def find_by_guid(cls, tag_guid):
        return cls.query.filter_by(permit_condition_tag_guid=tag_guid).first()
