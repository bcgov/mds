import uuid, datetime
from flask.globals import current_app

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy

from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.include.user_info import User
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.mines.project_summary.models.project_summary_document_xref import ProjectSummaryDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument


class ProjectSummary(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'project_summary'

    project_summary_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    project_summary_guid = db.Column(
        UUID(as_uuid=True), nullable=False, server_default=FetchedValue())
    project_summary_description = db.Column(db.String, nullable=False)
    project_summary_date = db.Column(db.DateTime, nullable=False)
    project_summary_lead = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    status_code = db.Column(
        db.String,
        db.ForeignKey('project_summary_status_code.project_summary_status_code'),
        nullable=False)

    # Note there is a dependency on deleted_ind in mine_documents
    documents = db.relationship('ProjectSummaryDocumentXref', lazy='select')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='project_summary_document_xref',
        secondaryjoin=
        'and_(foreign(ProjectSummaryDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid),MineDocument.deleted_ind == False)'
    )

    mine_table = db.relationship('Mine', lazy='joined')
    mine_name = association_proxy('mine_table', 'mine_name')
    mine_region = association_proxy('mine_table', 'mine_region')
    major_mine_ind = association_proxy('mine_table', 'major_mine_ind')

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_summary_id}'

    @classmethod
    def find_by_project_summary_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(project_summary_guid=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_guid=_id, deleted_ind=False).all()
        except ValueError:
            return None

    @classmethod
    def create(cls,
               mine,
               project_summary_date,
               project_summary_description,
               project_summary_lead,
               documents=[],
               add_to_session=True):
        project_summary = cls(
            project_summary_date=project_summary_date,
            project_summary_description=project_summary_description,
            project_summary_lead=project_summary_lead,
            mine_guid=mine.mine_guid,
            status_code='O')

        for doc in documents:
            project_summary_document_type_code = doc.get('project_summary_document_type_code')
            mine_doc = MineDocument(
                mine_guid=mine.mine_guid,
                document_name=doc.get('document_name'),
                document_manager_guid=doc.get('document_manager_guid'))
            project_summary_doc = ProjectSummaryDocumentXref(
                mine_document_guid=mine_doc.mine_document_guid,
                project_summary_id=project_summary.project_summary_id,
                project_summary_document_type_code=project_summary_document_type_code)
            project_summary_doc.mine_document = mine_doc
            project_summary.documents.append(project_summary_doc)

        if add_to_session:
            project_summary.save(commit=False)
        return project_summary

    def update(self,
               project_summary_date,
               project_summary_description,
               project_summary_lead,
               documents=[],
               add_to_session=True):

        # Update simple properties.
        self.project_summary_date = project_summary_date
        self.project_summary_description = project_summary_description
        self.project_summary_lead = project_summary_lead

        # Get the GUIDs of the updated documents.
        updated_document_guids = [doc.get('mine_document_guid') for doc in documents]

        # Delete deleted documents.
        # for doc in self.documents:
        #     if str(doc.mine_document_guid) not in updated_document_guids:
        #         self.mine_documents.remove(doc.mine_document)
        #         doc.mine_document.delete(commit=False)

        # Create or update existing documents.
        # for doc in documents:
        #     project_summary_document_type_code = doc.get('project_summary_document_type_code')
        #     mine_document_guid = doc.get('mine_document_guid')
        #     if mine_document_guid:
        #         project_summary_doc = ProjectSummaryDocumentXref.find_by_mine_document_guid(
        #             mine_document_guid)
        #         project_summary_doc.project_summary_document_type_code = project_summary_document_type_code
        #     else:
        #         mine_doc = MineDocument(
        #             mine_guid=self.mine_guid,
        #             document_name=doc.get('document_name'),
        #             document_manager_guid=doc.get('document_manager_guid'))
        #         project_summary_doc = ProjectSummaryDocumentXref(
        #             mine_document_guid=mine_doc.mine_document_guid,
        #             project_summary_id=self.project_summary_id,
        #             project_summary_document_type_code=project_summary_document_type_code)
        #         project_summary_doc.mine_document = mine_doc
        #         self.documents.append(project_summary_doc)

        if add_to_session:
            self.save(commit=False)
        return self

    def delete(self, commit=True):
        for doc in self.documents:
            self.mine_documents.remove(doc.mine_document)
            doc.mine_document.delete(False)
        super(ProjectSummary, self).delete(commit)
