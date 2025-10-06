from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from flask import current_app
from datetime import datetime, timezone
from app.api.utils.models_mixins import HistoryMixin, SoftDeleteMixin, AuditMixin, Base, DraftMixin
from app.api.projects.ams_final_application.models.ams_final_application_document_type import AmsFinalApplicationDocumentType
from app.api.projects.ams_final_application.models.ams_final_application_document_xref import AmsFinalApplicationDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument

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
    
    @hybrid_property
    def mine_guid(self):
        return self.project_summary_authorization.project_summary.project.mine_guid
    
    @hybrid_property
    def project_summary_guid(self):
        return self.project_summary_authorization.project_summary.project_summary_guid
    
    @staticmethod
    def find_by_authorization_guid(authorization_guid):
        return AmsFinalApplication.query.filter_by(project_summary_authorization_guid=authorization_guid).one_or_none()
    
    @staticmethod
    def find_by_project_summary_guid(project_summary_guid):
        return AmsFinalApplication.query.join(AmsFinalApplication.project_summary_authorization).filter_by(project_summary_guid=project_summary_guid).all()

    @classmethod
    def create(cls, 
               project_summary_authorization_guid,
               submitter_name,
               is_agent=False,
               pre_submitted_files=None,
               is_submitting=False
               ):
        final_app = cls(
            project_summary_authorization_guid=project_summary_authorization_guid,
            submitter_name=submitter_name,
            is_agent=is_agent,
            pre_submitted_files=pre_submitted_files or [],
        )
        if is_submitting:
            final_app.submitted_timestamp = datetime.now(timezone.utc)
            final_app.submit()
        else:
            final_app.save_draft()
        return final_app

    def update(self,          
               submitter_name,
               documents=[],
               is_agent=False,
               pre_submitted_files=None,
               is_submitting=False
               ):
        self.submitter_name = submitter_name
        self.is_agent = is_agent
        self.pre_submitted_files = pre_submitted_files or []
        self._update_documents(documents)

        if is_submitting:
            self.submitted_timestamp = self.submitted_timestamp or datetime.now(timezone.utc)
            self.submit()
        else:
            self.save_draft()
        return self

    def _update_documents(self, documents):  
        # Delete removed
        new_doc_guids = {d['document_manager_guid'] for d in documents if d.get('document_manager_guid')}
        deleted_documents = [d for d in self.documents if str(d.document_manager_guid) not in new_doc_guids]
 
        for xref in deleted_documents:
            xref.deleted_ind = True
            xref.save()

        # Add/update new
        for doc in documents:
            mine_document_guid = doc.get('mine_document_guid')
            doc_type_code = doc.get('ams_final_application_document_type_code')
            doc_type = AmsFinalApplicationDocumentType.get_by_document_code(doc_type_code)
            if not doc_type:
                current_app.logger.error(f'Invalid AmsFinalApplicationDocumentType: {doc_type_code}')
                continue  # skip invalid type
            
            if mine_document_guid:
                app_doc = AmsFinalApplicationDocumentXref.find_by_mine_document_guid(mine_document_guid)
                app_doc.ams_final_application_document_type_code = doc_type_code
  
            else:
                mine_doc = MineDocument(
                    mine_guid=self.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'),
                    mine_document_bundle_id=doc['mine_document_bundle_id'] if doc.get('mine_document_bundle_id') else None
                )
                app_doc = AmsFinalApplicationDocumentXref(
                    ams_final_application_guid=self.ams_final_application_guid,
                    mine_document=mine_doc,
                    ams_final_application_document_type_code=doc_type_code
                )

                self.documents.append(app_doc)