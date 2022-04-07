from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.schema import FetchedValue
from werkzeug.exceptions import BadRequest
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.projects.project_contact.models.project_contact import ProjectContact
from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.config import Config


class Project(AuditMixin, Base):
    __tablename__ = 'project'

    project_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    project_id = db.Column(db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    project_title = db.Column(db.String(300), nullable=False)
    proponent_project_id = db.Column(db.String(20), nullable=True)

    project_lead_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)

    project_summary = db.relationship("ProjectSummary", uselist=False, back_populates="project")
    project_lead = db.relationship(
        'Party', lazy='select', primaryjoin='Party.party_guid == Project.project_lead_party_guid')
    contacts = db.relationship(
        'ProjectContact',
        primaryjoin=
        'and_(ProjectContact.project_guid == Project.project_guid, ProjectContact.deleted_ind == False)',
        lazy='selectin')

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_id}'

    @hybrid_property
    def project_lead_name(self):
        if self.project_lead_party_guid:
            party = Party.find_by_party_guid(self.project_lead_party_guid)
            return party.name
        return None

    @classmethod
    def find_by_project_guid(cls, project_guid):
        return cls.query.filter_by(project_guid=project_guid).one_or_none()

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid).all()

    @classmethod
    def create(cls, mine, project_title, proponent_project_id, contacts=[], add_to_session=True):
        project = cls(
            project_title=project_title,
            proponent_project_id=proponent_project_id,
            mine_guid=mine.mine_guid)

        mine.projects.append(project)
        if add_to_session:
            project.save(commit=True)

        # Create contacts.
        for contact in contacts:
            new_contact = ProjectContact(
                project_guid=project.project_guid,
                name=contact.get('name'),
                job_title=contact.get('job_title'),
                company_name=contact.get('company_name'),
                email=contact.get('email'),
                phone_number=contact.get('phone_number'),
                phone_extension=contact.get('phone_extension'),
                is_primary=contact.get('is_primary'))
            project.contacts.append(new_contact)

        if add_to_session:
            project.save(commit=False)
        return project

    def update(self, project_title, proponent_project_id, contacts=[], add_to_session=True):

        # Update simple properties.
        self.project_title = project_title
        self.proponent_project_id = proponent_project_id

        # Delete deleted contacts.
        updated_contact_ids = [contact.get('project_contact_guid') for contact in contacts]
        for deleted_contact in self.contacts:
            if str(deleted_contact.project_contact_guid) not in updated_contact_ids:
                deleted_contact.delete(commit=False)

        # Create or update existing contacts.
        for contact in contacts:
            updated_contact_guid = contact.get('project_contact_guid')
            if updated_contact_guid:
                updated_contact = ProjectContact.find_project_contact_by_guid(updated_contact_guid)
                updated_contact.name = contact.get('name')
                updated_contact.job_title = contact.get('job_title')
                updated_contact.company_name = contact.get('company_name')
                updated_contact.email = contact.get('email')
                updated_contact.phone_number = contact.get('phone_number')
                updated_contact.phone_extension = contact.get('phone_extension')
                updated_contact.is_primary = contact.get('is_primary')

            else:
                new_contact = ProjectContact(
                    project_guid=self.project_guid,
                    name=contact.get('name'),
                    job_title=contact.get('job_title'),
                    company_name=contact.get('company_name'),
                    email=contact.get('email'),
                    phone_number=contact.get('phone_number'),
                    phone_extension=contact.get('phone_extension'),
                    is_primary=contact.get('is_primary'))
                self.contacts.append(new_contact)

        if add_to_session:
            self.save(commit=False)
        return self