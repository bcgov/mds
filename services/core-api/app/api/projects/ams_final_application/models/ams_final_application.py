from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import HistoryMixin, SoftDeleteMixin, AuditMixin, Base, DraftMixin
from app.api.projects.ams_final_application.models.ams_final_application_document_xref import AmsFinalApplicationDocumentXref

class AmsFinalApplication(HistoryMixin, SoftDeleteMixin, DraftMixin, AuditMixin, Base):
    __tablename__ = "ams_final_application"
    __versioned__ = {}

    ams_final_application_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    project_summary_authorization_guid = db.Column(
        UUID(as_uuid=True), 
        db.ForeignKey('project_summary_authorization.project_summary_authorization_guid'),
        nullable=False
    )
    submitter_name = db.Column(db.String(200), nullable=False)
    is_agent = db.Column(db.Boolean, nullable=False, default=False)
    pre_submitted_files = db.Column(db.ARRAY(db.String))
    submitted_timestamp = db.Column(db.DateTime)
    documents = db.relationship(
        AmsFinalApplicationDocumentXref,
        lazy='select',
        primaryjoin='and_(AmsFinalApplicationDocumentXref.ams_final_application_guid == AmsFinalApplication.ams_final_application_guid, AmsFinalApplicationDocumentXref.deleted_ind == False)'
    )
    project_summary_authorization = db.relationship("ProjectSummaryAuthorization", back_populates="ams_final_application")

    def __repr__(self):
        return f'{self.__class__.__name__} {self.ams_final_application_guid}'

    @staticmethod
    def find_by_authorization_guid(authorization_guid):
        return AmsFinalApplication.query.filter_by(project_summary_authorization_guid=authorization_guid).one_or_none()
    
    @staticmethod
    def find_by_project_summary_guid(project_summary_guid):
        return AmsFinalApplication.query.join(AmsFinalApplication.project_summary_authorization).filter_by(project_summary_guid=project_summary_guid).all()