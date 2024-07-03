from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


class MineDocumentBundle(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_document_bundle'

    bundle_id = db.Column(UUID(as_uuid=True), primary_key=True)
    bundle_guid = db.Column(UUID(as_uuid=True), nullable=False)
    bundle_name = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    geomark_id = db.Column(db.String(100), nullable=True)
    docman_bundle_guid = db.Column(UUID(as_uuid=True), nullable=True)
