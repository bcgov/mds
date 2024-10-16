from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.schema import FetchedValue


class PermitExtractionTask(AuditMixin, Base):
    __tablename__ = 'permit_extraction_task'

    # This is a unique identifier for the task
    permit_extraction_task_id = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=db.FetchedValue())
    
    # This is the task_id for the actual extraction task as returned by the permit service
    task_id = db.Column(db.String(255), nullable=False)
    task_status = db.Column(db.String(255), nullable=False)
    task_meta = db.Column(db.JSON, nullable=True)
    task_result = db.Column(db.JSON, nullable=True)

    # This is the task_id for the core celery task that is responsible for updating the status of the extraction task
    core_status_task_id = db.Column(db.String(255), nullable=True)
    
    permit_amendment_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('permit_amendment.permit_amendment_guid'), nullable=False)
    permit_amendment_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('permit_amendment_document.permit_amendment_document_guid'), nullable=False)

    permit_amendment = db.relationship('PermitAmendment', lazy='select')

    @staticmethod
    def get_by_task_id(task_id):
        return PermitExtractionTask.query.filter_by(task_id=task_id).order_by(PermitExtractionTask.create_timestamp.desc())

    @staticmethod
    def get_by_permit_extraction_task_id(permit_extraction_task_id):
        return PermitExtractionTask.query.filter_by(permit_extraction_task_id=permit_extraction_task_id).order_by(PermitExtractionTask.create_timestamp.desc())
    
    @staticmethod
    def get_by_permit_amendment_guid(permit_amendment_guid):
        return PermitExtractionTask.query.filter_by(permit_amendment_guid=permit_amendment_guid).order_by(PermitExtractionTask.create_timestamp.desc()).all()

    @classmethod
    def create(cls, **kwargs):
        obj = cls(**kwargs)
        db.session.add(obj)
        db.session.commit()
        return obj
