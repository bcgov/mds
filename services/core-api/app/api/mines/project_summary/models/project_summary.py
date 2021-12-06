from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy

from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.mines.project_summary.models.project_summary_document_xref import ProjectSummaryDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.parties.party.models.party import Party
from app.api.constants import PROJECT_SUMMARY_EMAILS
from app.api.services.email_service import EmailService
from app.config import Config


class ProjectSummary(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'project_summary'

    project_summary_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    project_summary_id = db.Column(
        db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    project_summary_description = db.Column(db.String(300), nullable=True)
    project_summary_date = db.Column(db.DateTime, nullable=True)
    project_summary_lead_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'))

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    status_code = db.Column(
        db.String,
        db.ForeignKey('project_summary_status_code.project_summary_status_code'),
        nullable=False)

    project_summary_lead = db.relationship(
        'Party',
        lazy='select',
        primaryjoin='Party.party_guid == ProjectSummary.project_summary_lead_party_guid')

    # Note there is a dependency on deleted_ind in mine_documents
    documents = db.relationship('ProjectSummaryDocumentXref', lazy='select')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='project_summary_document_xref',
        secondaryjoin=
        'and_(foreign(ProjectSummaryDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False)'
    )

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_summary_id}'

    @hybrid_property
    def project_summary_lead_name(self):
        if self.project_summary_lead_party_guid:
            party = Party.find_by_party_guid(self.project_summary_lead_party_guid)
            return party.name
        return None

    @classmethod
    def find_by_project_summary_guid(cls, project_summary_guid):
        return cls.query.filter_by(
            project_summary_guid=project_summary_guid, deleted_ind=False).one_or_none()

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid, deleted_ind=False).all()

    @classmethod
    def create(cls,
               mine,
               project_summary_date,
               project_summary_description,
               documents=[],
               add_to_session=True):
        project_summary = cls(
            project_summary_date=project_summary_date,
            project_summary_description=project_summary_description,
            mine_guid=mine.mine_guid,
            status_code='O')

        mine.project_summaries.append(project_summary)

        for doc in documents:
            mine_doc = MineDocument(
                mine_guid=mine.mine_guid,
                document_name=doc.get('document_name'),
                document_manager_guid=doc.get('document_manager_guid'))
            project_summary_doc = ProjectSummaryDocumentXref(
                mine_document_guid=mine_doc.mine_document_guid,
                project_summary_id=project_summary.project_summary_id,
                project_summary_document_type_code='GEN')
            project_summary_doc.mine_document = mine_doc
            project_summary.documents.append(project_summary_doc)

        if add_to_session:
            project_summary.save(commit=False)
        return project_summary

    def update(self,
               project_summary_date,
               project_summary_description,
               documents=[],
               add_to_session=True):

        # Update simple properties.
        self.project_summary_date = project_summary_date
        self.project_summary_description = project_summary_description

        # TODO - Turn this on when document removal is activated on the front end.
        # Get the GUIDs of the updated documents.
        # updated_document_guids = [doc.get('mine_document_guid') for doc in documents]

        # Delete deleted documents.
        # for doc in self.documents:
        #     if str(doc.mine_document_guid) not in updated_document_guids:
        #         self.mine_documents.remove(doc.mine_document)
        #         doc.mine_document.delete(commit=False)

        # Create or update existing documents.
        for doc in documents:
            mine_document_guid = doc.get('mine_document_guid')
            if mine_document_guid:
                project_summary_doc = ProjectSummaryDocumentXref.find_by_mine_document_guid(
                    mine_document_guid)
                project_summary_doc.project_summary_document_type_code = 'GEN'
            else:
                mine_doc = MineDocument(
                    mine_guid=self.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'))
                project_summary_doc = ProjectSummaryDocumentXref(
                    mine_document_guid=mine_doc.mine_document_guid,
                    project_summary_id=self.project_summary_id,
                    project_summary_document_type_code='GEN')
                project_summary_doc.mine_document = mine_doc
                self.documents.append(project_summary_doc)

        if add_to_session:
            self.save(commit=False)
        return self

    @classmethod
    def delete(self, commit=True):
        for doc in self.documents:
            self.mine_documents.remove(doc.mine_document)
            doc.mine_document.delete(False)
        super(ProjectSummary, self).delete(commit)

    def send_project_summary_email_to_ministry(self, mine):
        recipients = PROJECT_SUMMARY_EMAILS

        subject = f'Project Summary Notification for {mine.mine_name}'
        # subject = f'Project Summary Notification for'
        body = f'<p>{mine.mine_name} (Mine no: {mine.mine_no}) has submitted Project Summary data in MineSpace</p>'
        # body = f'<p> (Mine no: ) has submitted Project Summary data in MineSpace</p>'
        body += f'<p>Description: {self.project_summary_description}'

        link = f'{Config.CORE_PRODUCTION_URL}/mine-dashboard/{self.mine_guid}/permits-and-approvals/pre-applications'
        body += f'<p>View updates in Core: <a href="{link}" target="_blank">{link}</a></p>'
        EmailService.send_email(subject, recipients, body)