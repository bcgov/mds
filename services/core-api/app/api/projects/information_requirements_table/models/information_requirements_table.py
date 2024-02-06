from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from app.config import Config
from app.api.services.email_service import EmailService
from app.extensions import db
from app.api.constants import MAJOR_MINES_OFFICE_EMAIL
from app.api.projects.information_requirements_table.models.irt_requirements_xref import IRTRequirementsXref
from app.api.projects.information_requirements_table.models.information_requirements_table_document_xref import InformationRequirementsTableDocumentXref
from app.api.projects.project.models.project import Project
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base

from app.api.mines.mine.models.mine import Mine
from app.api.projects.project.project_util import ProjectUtil

class InformationRequirementsTable(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "information_requirements_table"

    irt_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    irt_id = db.Column(db.Integer, nullable=False, unique=True, server_default=FetchedValue())
    project_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('project.project_guid'), nullable=False)
    status_code = db.Column(
        db.String(3),
        db.ForeignKey(
            'information_requirements_table_status_code.information_requirements_table_status_code'
        ),
        nullable=False)

    project = db.relationship("Project", back_populates="information_requirements_table")
    requirements = db.relationship('IRTRequirementsXref', lazy='joined')

    documents = db.relationship('InformationRequirementsTableDocumentXref', lazy='select')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='information_requirements_table_document_xref',
        secondaryjoin=
        'and_(foreign(InformationRequirementsTableDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False, MineDocument.is_archived == False)',
        overlaps="information_requirements_table_document_xref,mine_document,documents"
    )

    def __repr__(self):
        return f'{self.__class__.__name__} {self.irt_id}, {self.irt_guid}'

    @classmethod
    def find_by_irt_guid(cls, _id):
        try:
            return cls.query.filter_by(irt_guid=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_irt_id(cls, _id):
        try:
            return cls.query.filter_by(irt_id=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_project_guid(cls, _id):
        try:
            return cls.query.filter_by(
                project_guid=_id, deleted_ind=False).order_by(cls.irt_id.desc()).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        qy = db.session.query(InformationRequirementsTable)
        try:
            if mine_document_guid is not None:
                query = qy\
                    .filter(InformationRequirementsTable.irt_id == InformationRequirementsTableDocumentXref.irt_id)\
                    .filter(InformationRequirementsTableDocumentXref.mine_document_guid == mine_document_guid)
                return query.first()

            raise ValueError("Missing 'mine_document_guid'")

        except ValueError:
            return None

    def send_irt_submit_email(self):
        project_lead_email = self.project.project_lead.email if self.project.project_lead else None
        recipients = [MAJOR_MINES_OFFICE_EMAIL, project_lead_email
                      ] if project_lead_email is not None else [MAJOR_MINES_OFFICE_EMAIL]

        subject = f'IRT Submitted for {self.project.mine_name}'
        body = f'<p>{self.project.mine_name} (Mine no: {self.project.mine_no}) has updated {self.project.project_title} by submitting an IRT.</p>'

        link = f'{Config.CORE_PRODUCTION_URL}/pre-applications/{self.project.project_guid}/information-requirements-table/{self.irt_guid}/intro-project-overview'
        body += f'<p>View IRT in Core: <a href="{link}" target="_blank">{link}</a></p>'
        EmailService.send_email(subject, recipients, body)

    def send_irt_approval_email(self):
        recipients = [contact.email for contact in self.project.contacts]
        link = f'{Config.MINESPACE_PRODUCTION_URL}/projects/{self.project.project_guid}/information-requirements-table/{self.irt_guid}/review/intro-project-overview'

        subject = f'IRT Notification for {self.project.mine_name}:{self.project.project_title}'
        body = f'<p>An IRT has been approved for {self.project.mine_name}:(Mine no: {self.project.mine_no})-{self.project.project_title}.</p>'
        body += f'<p>View IRT in Minespace: <a href="{link}" target="_blank">{link}</a></p>'

        EmailService.send_email(subject, recipients, body, send_to_proponent=True)

    def update(self, irt_data, import_file=None, document_guid=None, add_to_session=True):
        mine_doc = None
        project = None
        if import_file and document_guid:
            self.status_code = 'DFT'
            for requirement in self.requirements:
                requirement_to_update = list(
                    filter(
                        lambda imported_requirement: imported_requirement['requirement_guid'] ==
                        requirement['requirement_guid'], irt_data))

                if len(requirement_to_update) > 0:
                    requirement.undelete()
                    requirement.update(requirement_to_update[0]['required'],
                                       requirement_to_update[0]['methods'],
                                       requirement_to_update[0]['comment'])
                else:
                    requirement.delete()
                requirement.save()

            for new_requirement in irt_data:
                requirement_found = list(
                    filter(
                        lambda requirement: requirement['requirement_guid'] == new_requirement[
                            'requirement_guid'], self.requirements))

                if len(requirement_found) == 0:
                    new_req = IRTRequirementsXref.create(self.irt_guid,
                                                         new_requirement['requirement_guid'],
                                                         new_requirement['required'],
                                                         new_requirement['methods'],
                                                         new_requirement['comment'])
                    self.requirements.append(new_req)
                    self.save()

            project = Project.find_by_project_guid(self.project_guid)
            mine_doc = MineDocument(
                mine_guid=str(project.mine_guid),
                document_manager_guid=str(document_guid),
                document_name=import_file.filename)

            irt_template = InformationRequirementsTableDocumentXref(
                mine_document_guid=str(mine_doc.mine_document_guid),
                irt_id=self.irt_id,
                information_requirements_table_document_type_code='TEM')

            irt_template.mine_document = mine_doc
            if irt_template:
                self.documents.append(irt_template)
        else:
            self.status_code = irt_data['status_code']

        if add_to_session:
            self.save()

        if mine_doc and project:
            mine = Mine.find_by_mine_guid(mine_doc.mine_guid)
            ProjectUtil.notifiy_file_updates(project, mine)

        return self

    def delete(self):
        requirements = IRTRequirementsXref.find_by_irt_guid(self.irt_guid)
        if requirements:
            for requirement in requirements:
                requirement.delete()

        super(InformationRequirementsTable, self).delete()

    def save_new_irt(project, requirements, import_file, document_guid):
        new_information_requirements_table = InformationRequirementsTable._schema().load({
            'project_guid':
            project.project_guid,
            'status_code':
            'DFT',
            'requirements':
            requirements
        })

        new_information_requirements_table.save(commit=False)

        mine_doc = MineDocument(
            mine_guid=str(project.mine_guid),
            document_manager_guid=str(document_guid),
            document_name=import_file.filename)

        irt_template = InformationRequirementsTableDocumentXref(
            mine_document_guid=str(mine_doc.mine_document_guid),
            irt_id=new_information_requirements_table.irt_id,
            information_requirements_table_document_type_code='TEM')

        irt_template.mine_document = mine_doc
        new_information_requirements_table.documents.append(irt_template)

        new_information_requirements_table.save()

        return new_information_requirements_table, 201
