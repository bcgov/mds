from multiprocessing.sharedctypes import Value
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.schema import FetchedValue
from werkzeug.exceptions import BadRequest
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.projects.project.models.project import Project
from app.api.projects.major_mine_application.models.major_mine_application_document_xref import MajorMineApplicationDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument


class MajorMineApplication(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'major_mine_application'

    major_mine_application_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    major_mine_application_id = db.Column(
        db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    project_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('project.project_guid'), nullable=False)
    submission_project_title = db.Column(db.String(300), nullable=False)
    status_code = db.Column(
        db.String,
        db.ForeignKey('major_mine_application_status_code.major_mine_application_status_code'),
        nullable=False)
    project = db.relationship("Project", back_populates="major_mine_application")
    documents = db.relationship('MajorMineApplicationDocumentXref', lazy='select')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='major_mine_application_document_xref',
        secondaryjoin=
        'and_(foreign(MajorMineApplicationDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False)'
    )

    def __repr__(self):
        return f'{self.__class__.__name__} {self.major_mine_application_id}'

    @classmethod
    def find_by_major_mine_application_guid(cls, _id):
        try:
            return cls.query.filter_by(
                major_mine_application_guid=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_major_mine_application_id(cls, _id):
        try:
            return cls.query.filter_by(
                major_mine_application_id=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_project_guid(cls, _id):
        try:
            return cls.query.filter_by(
                project_guid=_id,
                deleted_ind=False).order_by(cls.major_mine_application_id.desc()).first()
        except ValueError:
            return None

    @classmethod
    def create(cls,
               project,
               submission_project_title,
               status_code,
               documents=[],
               add_to_session=True):
        major_mine_application = cls(
            submission_project_title=submission_project_title,
            project_guid=project.project_guid,
            status_code=status_code)

        if add_to_session:
            major_mine_application.save(commit=False)

        for doc in documents:
            mine_doc = MineDocument(
                mine_guid=project.mine_guid,
                document_name=doc.get('document_name'),
                document_manager_guid=doc.get('document_manager_guid'))
            major_mine_application_doc = MajorMineApplicationDocumentXref(
                mine_document_guid=mine_doc.mine_document_guid,
                major_mine_application_id=major_mine_application.major_mine_application_id,
                major_mine_application_document_type_code=doc.get(
                    'major_mine_application_document_type'))
            major_mine_application_doc.mine_document = mine_doc
            major_mine_application.documents.append(major_mine_application_doc)

        if add_to_session:
            major_mine_application.save(commit=False)

        return major_mine_application

    def delete(self, commit=True):
        for doc in self.documents:
            self.mine_documents.remove(doc.mine_document)
            doc.mine_document.delete(False)
        return super(MajorMineApplication, self).delete(commit)
