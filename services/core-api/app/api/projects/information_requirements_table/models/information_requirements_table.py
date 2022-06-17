from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from app.config import Config
from app.api.services.email_service import EmailService
from app.extensions import db
from app.api.constants import MAJOR_MINES_OFFICE_EMAIL
from app.api.projects.information_requirements_table.models.irt_requirements_xref import IRTRequirementsXref
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


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
        link = f'{Config.MINESPACE_PRODUCTION_URL}/projects/{self.project.project_guid}/information-requirements-table/review/intro-project-overview'

        subject = f'IRT Notification for {self.project.mine_name}:{self.project.project_title}'
        body = f'<p>An IRT has been approved for {self.project.mine_name}:(Mine no: {self.project.mine_no})-{self.project.project_title}.</p>'
        body += f'<p>View IRT in Minespace: <a href="{link}" target="_blank">{link}</a></p>'

        EmailService.send_email(subject, recipients, body, send_to_proponent=True)

    def update(self, irt_json, add_to_session=True):
        self.status_code = irt_json['status_code']

        if 'requirements' in irt_json.keys():
            for updated_req in irt_json['requirements']:
                saved = False
                for requirement in self.requirements:
                    if str(requirement.requirement_guid) == str(updated_req['requirement_guid']):
                        requirement.update(updated_req['required'], updated_req['methods'],
                                           updated_req['comment'])
                        requirement.save()
                        saved = True
                        break

                if not saved:
                    new_req = IRTRequirementsXref.create(irt_json['irt_guid'],
                                                         updated_req['requirement_guid'],
                                                         updated_req['required'],
                                                         updated_req['methods'],
                                                         updated_req['comment'])
                    self.requirements.append(new_req)
                    self.save()

        if add_to_session:
            self.save()

        return self

    def delete(self):
        requirements = IRTRequirementsXref.find_by_irt_guid(self.irt_guid)
        if requirements:
            for requirement in requirements:
                requirement.delete()

        super(InformationRequirementsTable, self).delete()
