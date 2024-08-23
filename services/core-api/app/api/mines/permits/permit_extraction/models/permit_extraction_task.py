from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db

class PermitExtractionTask(AuditMixin, Base):
    __tablename__ = 'permit_extraction_task'

    permit_extraction_task_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    task_id = db.Column(db.String(255), nullable=False)
    task_status = db.Column(db.String(3), nullable=False)
    permit_amendment_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('permit_amendment.permit_amendment_guid'), nullable=False)
    permit_amendment_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('permit_amendment_document.permit_amendment_document_guid'), nullable=False)

    @staticmethod
    def get_by_task_id(task_id):
        return PermitExtractionTask.query.filter_by(task_id=task_id).order_by(PermitExtractionTask.permit_extraction_task_id.desc())