from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
from app.api.utils.models_mixins import Base, SoftDeleteMixin, AuditMixin
from sqlalchemy.schema import FetchedValue


class ProjectContact(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'project_contact'

    project_contact_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    email = db.Column(db.String(254), nullable=False)
    phone_number = db.Column(db.String(12), nullable=False)
    is_primary = db.Column(db.Boolean, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    phone_extension = db.Column(db.String(6), nullable=True)
    job_title = db.Column(db.String(200), nullable=True)
    company_name = db.Column(db.String(100), nullable=True)

    project_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('project.project_guid'))

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_contact_guid}'

    @classmethod
    def create(cls,
               project_guid,
               name,
               job_title,
               company_name,
               email,
               phone_number,
               phone_extension,
               is_primary,
               add_to_session=True):
        new_contact = cls(
            project_guid=project_guid,
            name=name,
            job_title=job_title,
            company_name=company_name,
            email=email,
            phone_number=phone_number,
            phone_extension=phone_extension,
            is_primary=is_primary)

        if add_to_session:
            new_contact.save(commit=False)
        return new_contact

    def update(self,
               name,
               job_title,
               company_name,
               email,
               phone_number,
               phone_extension,
               add_to_session=True):
        self.name = name
        self.job_title = job_title
        self.company_name = company_name
        self.email = email
        self.phone_number = phone_number
        self.phone_extension = phone_extension

        if add_to_session:
            self.save(commit=False)
        return self

    def delete(self, commit=True):
        return super(ProjectContact, self).delete(commit)

    @classmethod
    def find_project_contact_by_guid(cls, project_contact_guid):
        return cls.query.filter_by(project_contact_guid=project_contact_guid).filter_by(
            deleted_ind=False).first()

    @classmethod
    def find_project_contacts_by_project_guid(cls, project_guid):
        return cls.query.filter_by(project_guid=project_guid).filter_by(deleted_ind=False).order_by(
            cls.is_primary).all()

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(deleted_ind=False).all()
