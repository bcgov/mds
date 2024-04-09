from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base
from app.api.projects.project_contact.models.project_contact import ProjectContact
from app.api.parties.party.models.address import Address
from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party

from app.api.utils.helpers import validate_phone_no


class Project(AuditMixin, Base):
    __tablename__ = 'project'

    project_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    project_id = db.Column(db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    project_title = db.Column(db.String(300), nullable=False)
    mrc_review_required = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    proponent_project_id = db.Column(db.String(20), nullable=True)

    project_lead_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)

    project_summary = db.relationship("ProjectSummary", uselist=False, back_populates="project")
    information_requirements_table = db.relationship(
        "InformationRequirementsTable", uselist=False, back_populates="project")
    major_mine_application = db.relationship(
        "MajorMineApplication", uselist=False, back_populates="project")
    project_decision_package = db.relationship(
        "ProjectDecisionPackage", uselist=False, back_populates="project")
    project_lead = db.relationship(
        'Party', lazy='select', primaryjoin='Party.party_guid == Project.project_lead_party_guid')
    contacts = db.relationship(
        'ProjectContact',
        primaryjoin='and_(ProjectContact.project_guid == Project.project_guid, ProjectContact.deleted_ind == False)',
        lazy='selectin')
    project_links = db.relationship(
        'ProjectLink',
        primaryjoin='or_(Project.project_guid == ProjectLink.project_guid, Project.project_guid == ProjectLink.related_project_guid)',
        lazy='selectin',
        back_populates='related_project'
    )

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_id}'

    @hybrid_property
    def project_lead_name(self):
        if self.project_lead_party_guid:
            party = Party.find_by_party_guid(self.project_lead_party_guid)
            return party.name
        return None

    @hybrid_property
    def mine_name(self):
        mine = Mine.find_by_mine_guid(str(self.mine_guid))
        if mine:
            return mine.mine_name
        return None

    @hybrid_property
    def mine_no(self):
        mine = Mine.find_by_mine_guid(str(self.mine_guid))
        if mine:
            return mine.mine_no
        return None

    @classmethod
    def find_by_project_guid(cls, project_guid):
        return cls.query.filter_by(project_guid=project_guid).one_or_none()

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid).all()

    @classmethod
    def create(cls,
               mine,
               project_title,
               proponent_project_id,
               mrc_review_required,
               contacts=[],
               project_lead_party_guid = None,
               add_to_session=True):
        project = cls(
            project_title=project_title,
            proponent_project_id=proponent_project_id,
            mine_guid=mine.mine_guid,
            mrc_review_required=mrc_review_required,
            project_lead_party_guid = project_lead_party_guid)

        mine.projects.append(project)
        if add_to_session:
            project.save(commit=True)

        # Create contacts.
        for contact in contacts:
            validate_phone_no(contact.get('phone_number'))
            new_contact = ProjectContact(
                project_guid=project.project_guid,
                job_title=contact.get('job_title'),
                company_name=contact.get('company_name'),
                email=contact.get('email'),
                phone_number=contact.get('phone_number'),
                phone_extension=contact.get('phone_extension'),
                first_name=contact.get('first_name'),
                last_name=contact.get('last_name'),
                is_primary=contact.get('is_primary'))
            project.contacts.append(new_contact)

        if add_to_session:
            project.save(commit=False)
        return project

    def update(self,
               project_title,
               proponent_project_id,
               project_lead_party_guid,
               mrc_review_required,
               contacts=[],
               add_to_session=True):

        # Update simple properties.
        self.project_title = project_title
        self.proponent_project_id = proponent_project_id
        self.project_lead_party_guid = project_lead_party_guid
        self.mrc_review_required = mrc_review_required

        # Delete deleted contacts.
        updated_contact_ids = [contact.get('project_contact_guid') for contact in contacts]
        for deleted_contact in self.contacts:
            if str(deleted_contact.project_contact_guid) not in updated_contact_ids:
                deleted_contact.delete(commit=False)

        # Create or update existing contacts.
        for contact in contacts:
            updated_contact_guid = contact.get('project_contact_guid')
            new_address_data = contact.get('address', None)
            if new_address_data:
                validate_phone_no(contact.get('phone_number'), new_address_data.get('address_type_code', "CAN"))
            else:
                validate_phone_no(contact.get('phone_number'))

            if updated_contact_guid:
                updated_contact = ProjectContact.find_project_contact_by_guid(updated_contact_guid)
                updated_contact.first_name = contact.get('first_name')
                updated_contact.last_name = contact.get('last_name')
                updated_contact.job_title = contact.get('job_title')
                updated_contact.company_name = contact.get('company_name')
                updated_contact.email = contact.get('email')
                updated_contact.phone_number = contact.get('phone_number')
                updated_contact.phone_extension = contact.get('phone_extension')
                updated_contact.is_primary = contact.get('is_primary')

                if new_address_data:
                    if len(updated_contact.address) > 0:
                        for key, value in new_address_data.items():
                            setattr(updated_contact.address[0], key, value)
                    elif len(updated_contact.address) == 0:
                        new_address = Address.create(
                            suite_no=new_address_data.get('suite_no', None),
                            address_line_1=new_address_data.get('address_line_1', None),
                            city=new_address_data.get('city', None),
                            sub_division_code=new_address_data.get('sub_division_code', None),
                            post_code=new_address_data.get('post_code', None),
                            address_type_code=new_address_data.get('address_type_code', None),
                        )
                        updated_contact.address.append(new_address)
            else:
                new_contact = ProjectContact(
                    project_guid=self.project_guid,
                    first_name =contact.get('first_name'),
                    last_name =contact.get('last_name'),
                    job_title=contact.get('job_title'),
                    company_name=contact.get('company_name'),
                    email=contact.get('email'),
                    phone_number=contact.get('phone_number'),
                    phone_extension=contact.get('phone_extension'),
                    is_primary=contact.get('is_primary'))

                if new_address_data:
                    new_address = Address.create(
                        suite_no=new_address_data.get('suite_no', None),
                        address_line_1=new_address_data.get('address_line_1', None),
                        city=new_address_data.get('city', None),
                        sub_division_code=new_address_data.get('sub_division_code', None),
                        post_code=new_address_data.get('post_code', None),
                        address_type_code=new_address_data.get('address_type_code', None),
                    )
                    new_contact.address.append(new_address)
                self.contacts.append(new_contact)

        if add_to_session:
            self.save(commit=False)
        return self
