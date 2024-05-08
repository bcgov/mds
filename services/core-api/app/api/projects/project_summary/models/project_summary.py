from flask import current_app
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.schema import FetchedValue
from sqlalchemy import case
from werkzeug.exceptions import BadRequest

from app.api.parties.party import PartyOrgBookEntity
from app.api.services.ams_api_service import AMSApiService
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.utils.access_decorators import is_minespace_user
from app.api.projects.project_summary.models.project_summary_document_xref import ProjectSummaryDocumentXref
from app.api.mines.mine.models.mine import Mine
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.projects.project.models.project import Project
from app.api.projects.project_contact.models.project_contact import ProjectContact
from app.api.projects.project_summary.models.project_summary_contact import ProjectSummaryContact
from app.api.projects.project_summary.models.project_summary_authorization import ProjectSummaryAuthorization
from app.api.projects.project_summary.models.project_summary_authorization_document_xref import ProjectSummaryAuthorizationDocumentXref
from app.api.projects.project_summary.models.project_summary_permit_type import ProjectSummaryPermitType
from app.api.parties.party.models.party import Party
from app.api.parties.party.models.address import Address
from app.api.constants import PROJECT_SUMMARY_EMAILS, MDS_EMAIL
from app.api.services.email_service import EmailService
from app.config import Config
from cerberus import Validator
import json

from app.api.utils.common_validation_schemas import primary_address_schema, base_address_schema, address_na_schema, address_int_schema, party_base_schema, project_summary_base_schema

class ProjectSummary(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'project_summary'

    project_summary_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    project_summary_id = db.Column(
        db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    project_summary_description = db.Column(db.String(4000), nullable=True)
    submission_date = db.Column(db.DateTime, nullable=True)
    expected_draft_irt_submission_date = db.Column(db.DateTime, nullable=True)
    expected_permit_application_date = db.Column(db.DateTime, nullable=True)
    expected_permit_receipt_date = db.Column(db.DateTime, nullable=True)
    expected_project_start_date = db.Column(db.DateTime, nullable=True)
    agent_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=True)
    is_agent = db.Column(db.Boolean, nullable=True)
    facility_operator_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=True)
    is_legal_land_owner = db.Column(db.Boolean, nullable=True)
    is_crown_land_federal_or_provincial = db.Column(db.Boolean, nullable=True)
    is_landowner_aware_of_discharge_application = db.Column(db.Boolean, nullable=True)
    has_landowner_received_copy_of_application = db.Column(db.Boolean, nullable=True)
    legal_land_owner_name = db.Column(db.String(200), nullable=True)
    legal_land_owner_contact_number = db.Column(db.String(20), nullable=True)
    legal_land_owner_email_address = db.Column(db.String(200), nullable=True)
    facility_type = db.Column(db.String, nullable=True)
    facility_desc = db.Column(db.String(4000), nullable=True)
    facility_latitude = db.Column(db.Numeric(9, 7), nullable=True)
    facility_longitude = db.Column(db.Numeric(11, 7), nullable=True)
    facility_coords_source = db.Column(db.String(3), nullable=True)
    facility_coords_source_desc = db.Column(db.String(4000), nullable=True)
    facility_pid_pin_crown_file_no = db.Column(db.String(100), nullable=True)
    legal_land_desc = db.Column(db.String(4000), nullable=True)
    facility_lease_no = db.Column(db.String, nullable=True)
    zoning = db.Column(db.Boolean, nullable=True)
    zoning_reason = db.Column(db.String, nullable=True)
    nearest_municipality_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('municipality.municipality_guid'))
    company_alias = db.Column(db.String(200), nullable=True)

    is_legal_address_same_as_mailing_address = db.Column(db.Boolean, nullable=True)
    is_billing_address_same_as_mailing_address = db.Column(db.Boolean, nullable=True)
    is_billing_address_same_as_legal_address = db.Column(db.Boolean, nullable=True)

    applicant_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=True)

    project_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('project.project_guid'), nullable=False)
    status_code = db.Column(
        db.String,
        db.ForeignKey('project_summary_status_code.project_summary_status_code'),
        nullable=False)

    project = db.relationship("Project", back_populates="project_summary")
    contacts = db.relationship(
        'ProjectContact',
        primaryjoin="and_(ProjectSummary.project_guid==foreign(ProjectContact.project_guid), ProjectContact.deleted_ind == False)",
        overlaps="contacts"
    )
    agent = db.relationship(
        'Party', lazy='joined', foreign_keys=agent_party_guid
    )
    facility_operator = db.relationship(
        'Party', lazy='joined', foreign_keys=facility_operator_guid
    )
    
    nearest_municipality = db.relationship(
        'Municipality', lazy='joined', foreign_keys=nearest_municipality_guid
    )

    authorizations = db.relationship(
        'ProjectSummaryAuthorization',
        primaryjoin='and_(ProjectSummaryAuthorization.project_summary_guid == ProjectSummary.project_summary_guid, ProjectSummaryAuthorization.deleted_ind == False)',
        lazy='selectin')

    # Note there is a dependency on deleted_ind in mine_documents
    documents = db.relationship(
        'ProjectSummaryDocumentXref',
        lazy='select',
        primaryjoin='and_(ProjectSummaryDocumentXref.project_summary_id == ProjectSummary.project_summary_id, ProjectSummaryDocumentXref.mine_document_guid == MineDocument.mine_document_guid, MineDocument.is_archived == False)'
    )

    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='project_summary_document_xref',
        secondaryjoin='and_(and_(foreign(ProjectSummaryDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False), MineDocument.is_archived == False)',
        overlaps="mine_document,project_summary_document_xref,documents"
    )

    applicant = db.relationship(
        'Party', lazy='joined', foreign_keys=applicant_party_guid
    )

    municipality = db.relationship(
        'Municipality', lazy='joined', foreign_keys=nearest_municipality_guid
    )

    @classmethod
    def __get_address_type_code(cls, address_data):
        if isinstance(address_data, list):
            return address_data[0].get('address_type_code')
        return address_data.get('address_type_code')

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_summary_id}'

    @hybrid_property
    def project_summary_lead_name(self):
        if self.project.project_lead_party_guid:
            party = Party.find_by_party_guid(self.project.project_lead_party_guid)
            return party.name
        return None

    @hybrid_property
    def project_summary_lead_party_guid(self):
        if self.project.project_lead_party_guid:
            return self.project.project_lead_party_guid
        return None

    @hybrid_property
    def mine_guid(self):
        if self.project.mine_guid:
            return self.project.mine_guid
        return None

    @mine_guid.expression
    def mine_guid(cls):
        return case(
            [(cls.project.has(Project.mine_guid.isnot(None)), Project.mine_guid)],
            else_=None
        )


    @hybrid_property
    def mine_name(self):
        if self.project.mine_guid:
            mine = Mine.find_by_mine_guid(str(self.project.mine_guid))
            return mine.mine_name
        return None

    @hybrid_property
    def project_summary_title(self):
        if self.project.project_title:
            return self.project.project_title
        return None

    @hybrid_property
    def proponent_project_id(self):
        if self.project.proponent_project_id:
            return self.project.proponent_project_id
        return None

    @classmethod
    def find_by_project_summary_guid(cls, project_summary_guid, is_minespace_user=False):
        if is_minespace_user:
            return cls.query.filter_by(
                project_summary_guid=project_summary_guid, deleted_ind=False).one_or_none()
        return cls.query.filter(ProjectSummary.status_code.is_distinct_from("DFT")).filter_by(
            project_summary_guid=project_summary_guid, deleted_ind=False).one_or_none()

    @classmethod
    def find_by_mine_guid(cls, mine_guid_to_search):
        return cls.query.filter(cls.mine_guid == mine_guid_to_search).all()

    @classmethod
    def find_by_project_guid(cls, project_guid, is_minespace_user):
        if is_minespace_user:
            return cls.query.filter_by(project_guid=project_guid, deleted_ind=False).all()
        return cls.query.filter(ProjectSummary.status_code.is_distinct_from("DFT")).filter_by(
            project_guid=project_guid, deleted_ind=False).all()

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        qy = db.session.query(ProjectSummary)
        try:
            if mine_document_guid is not None:
                query = qy \
                    .filter(ProjectSummary.project_summary_id == ProjectSummaryDocumentXref.project_summary_id) \
                    .filter(ProjectSummaryDocumentXref.mine_document_guid == mine_document_guid)
                return query.first()

            raise ValueError("Missing 'mine_document_guid'")

        except ValueError:
            return None

    # will update the existing party and address data if it exists, else create a new one
    @classmethod
    def create_or_update_party(cls, party_data, job_title_code, existing_party):
        address_data = party_data.get('address')
        party_guid = party_data.get('party_guid')
        # Check if party_name is a dictionary (JSON object). Applicable to data coming from orgbook component
        if isinstance(party_data.get('party_name'), dict):
            # Update party_name with the label if it exists
            party_data['party_name'] = party_data['party_name'].get('label')

        if party_guid is not None and existing_party is not None:
            existing_party.deep_update_from_dict(party_data)
            if isinstance(address_data, list):
                for idx, address_item in enumerate(address_data):
                    if idx < len(address_data):
                        for key, value in address_item.items():
                            setattr(existing_party.address[idx], key, value)
            else:
                for key, value in address_data.items():
                    setattr(existing_party.address[0], key, value)
            return existing_party
        else:
            new_party = Party.create(
                party_name=party_data.get('party_name'),
                first_name=party_data.get('first_name'),
                phone_no=party_data.get('phone_no'),
                phone_ext=party_data.get('phone_ext'),
                email=party_data.get('email'),
                party_type_code=party_data.get('party_type_code'),
                job_title=party_data.get('job_title'),
                job_title_code=job_title_code,
                address_type_code=cls.__get_address_type_code(address_data),
                middle_name=party_data.get('middle_name'),
                credential_id=party_data.get('credential_id')
            )

            if isinstance(address_data, list):
                for addr in address_data:
                    new_address = Address.create(
                        suite_no=addr.get('suite_no'),
                        address_line_1=addr.get('address_line_1'),
                        city=addr.get('city'),
                        sub_division_code=addr.get('sub_division_code'),
                        post_code=addr.get('post_code'),
                        address_type_code=addr.get('address_type_code'),
                    )
                    new_party.address.append(new_address)
            else:
                new_address = Address.create(
                    suite_no=address_data.get('suite_no'),
                    address_line_1=address_data.get('address_line_1'),
                    city=address_data.get('city'),
                    sub_division_code=address_data.get('sub_division_code'),
                    post_code=address_data.get('post_code'),
                    address_type_code=address_data.get('address_type_code'),
                )
                new_party.address.append(new_address)
            return new_party

    def create_or_update_authorization(self, authorization):
            updated_authorization_guid = authorization.get('project_summary_authorization_guid')

            if updated_authorization_guid:
                updated_authorization = ProjectSummaryAuthorization.find_by_project_summary_authorization_guid(
                    updated_authorization_guid)
                updated_authorization.project_summary_permit_type = authorization.get(
                    'project_summary_permit_type')
                updated_authorization.existing_permits_authorizations = authorization.get(
                    'existing_permits_authorizations')
                updated_authorization.amendment_changes = authorization.get('amendment_changes')
                updated_authorization.amendment_severity = authorization.get('amendment_severity')
                updated_authorization.is_contaminated = authorization.get('is_contaminated')
                updated_authorization.new_type = authorization.get('new_type')
                updated_authorization.authorization_description = authorization.get('authorization_description')
                updated_authorization.exemption_requested = authorization.get('exemption_requested')
                updated_authorization.ams_tracking_number = authorization.get('ams_tracking_number')
                updated_authorization.ams_outcome = authorization.get('ams_outcome')
                updated_authorization.ams_status_code = authorization.get('ams_status_code')

                if authorization.get('amendment_documents') is not None:
                    for doc in authorization.get('amendment_documents'):
                        mine_doc = MineDocument(
                            mine_guid=self.mine_guid,
                            document_name=doc.get('document_name'),
                            document_manager_guid=doc.get('document_manager_guid'))
                        project_summary_authorization_doc = ProjectSummaryAuthorizationDocumentXref(
                            mine_document_guid=mine_doc.mine_document_guid,
                            project_summary_authorization_guid=updated_authorization.project_summary_authorization_guid,
                            project_summary_document_type_code=doc.get('project_summary_document_type_code'))
                        project_summary_authorization_doc.mine_document = mine_doc
                        updated_authorization.amendment_documents.append(project_summary_authorization_doc)
            else:
                new_authorization = ProjectSummaryAuthorization(
                    project_summary_guid=self.project_summary_guid,
                    project_summary_authorization_type=authorization.get(
                        'project_summary_authorization_type'),
                    project_summary_permit_type=authorization.get('project_summary_permit_type'),
                    existing_permits_authorizations=authorization.get(
                        'existing_permits_authorizations'),
                    amendment_changes=authorization.get('amendment_changes'),
                    amendment_severity=authorization.get('amendment_severity'),
                    is_contaminated=authorization.get('is_contaminated'),
                    new_type=authorization.get('new_type'),
                    authorization_description=authorization.get('authorization_description'),
                    exemption_requested=authorization.get('exemption_requested'),
                    ams_tracking_number=authorization.get('ams_tracking_number'),
                    ams_outcome=authorization.get('ams_outcome')
                )
# Check only for new files
                if authorization.get('amendment_documents') is not None:
                    for doc in authorization.get('amendment_documents'):
                        mine_doc = MineDocument(
                            mine_guid=self.mine_guid,
                            document_name=doc.get('document_name'),
                            document_manager_guid=doc.get('document_manager_guid'))
                        project_summary_authorization_doc = ProjectSummaryAuthorizationDocumentXref(
                            mine_document_guid=mine_doc.mine_document_guid,
                            project_summary_authorization_guid=new_authorization.project_summary_authorization_guid,
                            project_summary_document_type_code=doc.get('project_summary_document_type_code'))
                        project_summary_authorization_doc.mine_document = mine_doc
                        new_authorization.amendment_documents.append(project_summary_authorization_doc)

                self.authorizations.append(new_authorization)

    @classmethod
    def validate_project_party(cls, party, section):
        person_schema = party_base_schema | {
            'first_name': {
                'required': True,
                'type': 'string',
            },
        }

        org_schema = party_base_schema | {
            'first_name': {
                'nullable': True,
                'type': 'string',
            },
        }

        agent_address_schema = base_address_schema | {
            'address_type_code': {
                'type': 'string',
                'required': True,
                'allowed': ['INT', 'USA', 'CAN'],
            },
            'post_code': {
                'nullable': True,
                'type': 'string',
            },
        }

        facility_address_schema = base_address_schema | {
            'address_type_code': {
                'type': 'string',
                'nullable': True,
                'allowed': ['INT', 'USA', 'CAN'],
            },
            'post_code': {
                'type': 'string',
                'required': True,
            }, 
        }

        party_na_phone_schema = {
            'phone_no': {
                'type': 'string',
                'required': True,
                'regex': '[0-9]{3}-[0-9]{3}-[0-9]{4}',
            },
        }

        party_int_phone_schema = {
            'phone_no': {
                'type': 'string',
                'required': True,
                'maxlength': 50,
            },
        }

        party_type_code = party.get('party_type_code', None)
        address_data = party.get('address')
        base_schema = person_schema if (party_type_code == None or party_type_code == 'PER') else org_schema
        address_type_code = address_data[0].get('address_type_code') if isinstance(address_data, list) else address_data.get('address_type_code')

        if address_type_code == 'INT':
            base_schema |= party_int_phone_schema
            address_schema = address_int_schema
        else:
            base_schema |= party_na_phone_schema
            address_schema = address_na_schema

        if section == 'Applicant' or section == 'Agent':
            base_schema |= {
                'email': {
                    'required': True,
                    'type': 'string',
                },    
            }

            if section == 'Applicant':
                address_schema |= primary_address_schema
            else:
                address_schema |= agent_address_schema
        elif section == 'Facility':
            address_schema |= facility_address_schema
            base_schema |= {
                'email': {
                    'nullable': True,
                    'type': 'string',
                },
            }

        base_schema |= {
                'address': {
                    'required': True,
                    'anyof': [
                        {
                            'type': 'list',
                            'empty': False,
                            'schema': {
                                'type': 'dict',
                                'schema': address_schema,
                            },
                        },
                        {
                            'type': 'dict',
                            'schema': address_schema,
                        },
                    ],
                },    
        }
            
        v = Validator(base_schema, purge_unknown=True)
        if not v.validate(party):
            return json.dumps(v.errors)
        return True

    @classmethod
    def validate_legal_land(self, data):
        legal_land_owner_schema = {
            'is_crown_land_federal_or_provincial': {
                'required': True,
                'type': 'boolean',
            },
            'is_landowner_aware_of_discharge_application': {
                'required': True,
                'type': 'boolean',
            },
            'has_landowner_received_copy_of_application': {
                'required': True,
                'type': 'boolean',
            },
            'legal_land_owner_name': {
                'required': True,
                'type': 'string',
            },
            'legal_land_owner_contact_number': {
                'required': True,
                'type': 'string',
                'regex': '[0-9]{3}-[0-9]{3}-[0-9]{4}',               
            },
            'legal_land_owner_email_address': {
                'required': True,
                'type': 'string',               
            },
        }

        v = Validator(legal_land_owner_schema, purge_unknown=True)
       
        if not v.validate(data):
            return json.dumps(v.errors)
        return True
        
    @classmethod
    def validate_declaration(self, data):
        declaration_schema = {
            'confirmation_of_submission': {
                'required': True,
                'type': 'boolean',
                'allowed': [True],
            },
        }

        ams_authorizations = data.get('ams_authorizations', {})
        ams_new = ams_authorizations.get('new', [])
        ams_amendments = ams_authorizations.get('amendments', [])

        if len(ams_new) == 0 and len(ams_amendments) == 0:
            declaration_schema |= {
                'ams_terms_agreed': {
                    'nullable': True,
                    'type': 'boolean',
                }
            }
        else:
            declaration_schema |= {
                'ams_terms_agreed': {
                    'required': True,
                    'type': 'boolean',
                }
            }

        v = Validator(declaration_schema, purge_unknown=True)
       
        if not v.validate(data):
            return json.dumps(v.errors)
        return True

    @classmethod
    def validate_project_summary_surface_level_data(self, data):
        draft_surface_level_schema = project_summary_base_schema | {
            'contacts': {
                'required': True,
                'type': 'list',
            },
            'applicant': {
                'nullable': True,
                'type': 'dict',
            },
            'is_agent': {
                'nullable': True,
                'type': 'boolean',
            },
            'facility_coords_source': {
                'nullable': True,
                'type': 'string',
                'allowed': ['GPS', 'SUR', 'GGE', 'OTH'],
            },
            'facility_desc': {
                'nullable': True,
                'maxlength': 4000,
                'type': 'string'
            },
            'facility_latitude': {
                'nullable': True,
                'min': 47,
                'max': 60,
                'type': 'number',
            },
            'facility_longitude': {
                'nullable': True,
                'min': -140,
                'max': -113,
                'type': 'number',
            },
            'facility_operator': {
                'nullable': True,
                'type': 'dict',
            },
            'facility_type': {
                'nullable': True,
                'type': 'string'
            },
            'zoning': {
                'nullable': True,
                'type': 'boolean',
            },
            'legal_land_desc': {
                'nullable': True,
                'type': 'string',
            },
            'is_legal_land_owner': {
                'nullable': True,
                'type': 'boolean',
            },
            'nearest_municipality': {
                'nullable': True,
                'type': 'string',
            },
        }

        submission_surface_level_schema = project_summary_base_schema | {
            'contacts': {
                'required': True,
                'type': 'list',
                'empty': False,
            },
            'applicant': {
                'required': True,
                'type': 'dict',
            },
            'is_agent': {
                'required': True,
                'type': 'boolean',
            },
            'facility_coords_source': {
                'required': True,
                'type': 'string',
                'allowed': ['GPS', 'SUR', 'GGE', 'OTH'],
            },
            'facility_desc': {
                'required': True,
                'maxlength': 4000,
                'type': 'string',
            },
            'facility_latitude': {
                'required': True,
                'min': 47,
                'max': 60,
                'type': 'number',
            },
            'facility_longitude': {
                'required': True,
                'min': -140,
                'max': -113,
                'type': 'number'
            },
            'facility_operator': {
                'required': True,
                'type': 'dict',
            },
            'facility_type': {
                'required': True,
                'type': 'string',
            },
            'zoning': {
                'required': True,
                'type': 'boolean',
            },
            'legal_land_desc': {
                'nullable': True,
                'type': 'string',
            },
            'is_legal_land_owner': {
                'required': True,
                'type': 'boolean',
            },
            'nearest_municipality': {
                'nullable': True,
                'type': 'string',
            },
        }

        status_code = data.get('status_code')
        facility_latitude = data.get('facility_latitude', None)
        facility_longitude = data.get('facility_longitude', None)
        facility_coords_source = data.get('facility_coords_source', None)
        zoning = data.get('zoning', None)

        surface_data_to_validate = data
        if facility_latitude != None and facility_longitude != None:
            surface_data_to_validate = {**data, 'facility_latitude': float(facility_latitude), 'facility_longitude': float(facility_longitude)}

        surface_level_schema = submission_surface_level_schema if status_code == 'SUB' else draft_surface_level_schema

        if zoning == False:
            surface_level_schema |= {
                'zoning_reason': {
                    'required': True,
                    'type': 'string',
                },         
            }
        
        if facility_coords_source == 'OTH':
            surface_level_schema |= {
                'facility_coords_source_desc': {
                    'required': True,
                    'type': 'string',
                },     
            }

        v = Validator(surface_level_schema, purge_unknown=True)
        if not v.validate(surface_data_to_validate):
            return json.dumps(v.errors)
        return True

    @classmethod
    def validate_project_summary(cls, data):
        status_code = data.get('status_code')
        ams_authorizations = data.get('ams_authorizations', None)
        authorizations = data.get('authorizations',[])
        contacts = data.get('contacts')
        applicant = data.get('applicant', None)
        agent = data.get('agent', None)
        is_agent = data.get('is_agent', None)
        facility_operator = data.get('facility_operator', None)
        is_legal_land_owner = data.get('is_legal_land_owner', None)

        errors_found = {
            'surface_level_data': [],
            'basic_info': [],
            'authorizations': [],
            'project_contacts': [],
            'applicant_info': [],
            'agent': [],
            'facility': [],
            'legal_land': [],
            'declaration': [],
        }

        # Validate surface level data of payload
        surface_level_validation = ProjectSummary.validate_project_summary_surface_level_data(data)
        if surface_level_validation != True:
            errors_found['surface_level_data'].append(surface_level_validation)

        # Validate Basic Information
        basic_info_validation = Project.validate_project_basic_info(data)
        if basic_info_validation != True:
            errors_found['basic_info'].append(basic_info_validation)

        # Validate Authorizations Involved
        if (status_code == 'SUB'
            and len(ams_authorizations.get('amendments', [])) == 0 
            and len(ams_authorizations.get('new', [])) == 0 
            and len(authorizations) == 0):
                errors_found['authorizations'].append('Authorizations Involved not provided')
        
        for authorization in authorizations:
            authorization_validation = ProjectSummaryAuthorization.validate_authorization(authorization, False)
            if authorization_validation != True:
                errors_found['authorizations'].append(authorization_validation)

        if ams_authorizations:
            for authorization in ams_authorizations.get('amendments', []):
                ams_authorization_amendments_validation = ProjectSummaryAuthorization.validate_authorization(authorization, True)
                if ams_authorization_amendments_validation != True:
                    errors_found['authorizations'].append(ams_authorization_amendments_validation)

            for authorization in ams_authorizations.get('new', []):
                ams_authorization_new_validation = ProjectSummaryAuthorization.validate_authorization(authorization, True)
                if ams_authorization_new_validation != True:
                    errors_found['authorizations'].append(ams_authorization_new_validation)

        # Validate Project Contacts
        for contact in contacts:
            contact_validation = Project.validate_project_contacts(contact)
            if contact_validation != True:
                errors_found['project_contacts'].append(contact_validation)

        # Validate Applicant Information
        if applicant != None:
            applicant_validation = ProjectSummary.validate_project_party(applicant, 'Applicant')
            if applicant_validation != True:
                errors_found['applicant_info'].append(applicant_validation)

        # Validate Agent
        if is_agent == True:
            agent_validation = ProjectSummary.validate_project_party(agent, 'Agent')
            if agent_validation != True:
                errors_found['agent'].append(agent_validation)
        
        # Validate Facility Operator Information
        if facility_operator != None:
            facility_validation = ProjectSummary.validate_project_party(facility_operator, 'Facility')
            if facility_validation != True:
                errors_found['facility'].append(facility_validation)

        # Validate Legal Land Owner Information
        if is_legal_land_owner == False:
            legal_land_validation = ProjectSummary.validate_legal_land(data)
            if legal_land_validation != True:
                errors_found['legal_land'].append(legal_land_validation)

        # Validate Declaration
        if status_code == 'SUB':
            declaration_validation = ProjectSummary.validate_declaration(data)
            if declaration_validation != True:
                errors_found['declaration'].append(declaration_validation)

        return errors_found

    def get_ams_tracking_details(self, ams_tracking_results, project_summary_authorization_guid):
        if not ams_tracking_results:
            return None

        ams_tracking_result = next((item for item in ams_tracking_results if item.get(
            'project_summary_authorization_guid') == project_summary_authorization_guid), None)
        return ams_tracking_result
        
    @classmethod
    def create(cls,
               project,
               mine,
               project_summary_description,
               expected_draft_irt_submission_date,
               expected_permit_application_date,
               expected_permit_receipt_date,
               expected_project_start_date,
               status_code,
               documents=[],
               authorizations=[],
               ams_authorizations=None,
               submission_date=None,
               add_to_session=True):

        project_summary = cls(
            project_summary_description=project_summary_description,
            project_guid=project.project_guid,
            expected_draft_irt_submission_date=expected_draft_irt_submission_date,
            expected_permit_application_date=expected_permit_application_date,
            expected_permit_receipt_date=expected_permit_receipt_date,
            expected_project_start_date=expected_project_start_date,
            status_code=status_code,
            submission_date=submission_date)

        if add_to_session:
            project_summary.save(commit=False)

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

        for authorization in authorizations:
            project_summary.create_or_update_authorization(authorization)

        if ams_authorizations:
            for authorization in ams_authorizations.get('amendments', []):
                project_summary.create_or_update_authorization(authorization)

            for authorization in ams_authorizations.get('new', []):
                project_summary.create_or_update_authorization(authorization)
        

        if add_to_session:
            project_summary.save(commit=False)
        return project_summary

    def _get_party_name(self, data):
        if isinstance(data, dict):
            return data.get("value")
        elif isinstance(data, str):
            return data
        else:
            return None

    def update(self,
               project,
               project_summary_description,
               expected_draft_irt_submission_date,
               expected_permit_application_date,
               expected_permit_receipt_date,
               expected_project_start_date,
               status_code,
               project_lead_party_guid,
               documents=[],
               authorizations=[],
               ams_authorizations=None,
               submission_date=None,
               agent=None,
               is_agent=None,
               is_legal_land_owner=None,
               is_crown_land_federal_or_provincial=None,
               is_landowner_aware_of_discharge_application=None,
               has_landowner_received_copy_of_application=None,
               legal_land_owner_name=None,
               legal_land_owner_contact_number=None,
               legal_land_owner_email_address=None,
               facility_operator=None,
               facility_type=None,
               facility_desc=None,
               facility_latitude=None,
               facility_longitude=None,
               facility_coords_source=None,
               facility_coords_source_desc=None,
               facility_pid_pin_crown_file_no=None,
               legal_land_desc=None,
               facility_lease_no=None,
               zoning=None,
               zoning_reason=None,
               nearest_municipality=None,
               applicant=None,
               is_legal_address_same_as_mailing_address=None,
               is_billing_address_same_as_mailing_address=None,
               is_billing_address_same_as_legal_address=None,
               contacts=None,
               company_alias=None,
               add_to_session=True):
        
        # Update simple properties.
        # If we assign a project lead update status to Assigned and vice versa Submitted.
        if project_lead_party_guid and project.project_lead_party_guid is None:
            self.status_code = "ASG"
        elif project_lead_party_guid is None and project.project_lead_party_guid:
            self.status_code = "SUB"
        else:
            self.status_code = status_code

        self.project_summary_description = project_summary_description
        self.expected_draft_irt_submission_date = expected_draft_irt_submission_date
        self.expected_permit_application_date = expected_permit_application_date
        self.expected_permit_receipt_date = expected_permit_receipt_date
        self.expected_project_start_date = expected_project_start_date
        self.submission_date = submission_date
        self.is_legal_land_owner = is_legal_land_owner
        self.is_crown_land_federal_or_provincial = is_crown_land_federal_or_provincial
        self.is_landowner_aware_of_discharge_application = is_landowner_aware_of_discharge_application
        self.has_landowner_received_copy_of_application = has_landowner_received_copy_of_application
        self.legal_land_owner_name = legal_land_owner_name
        self.legal_land_owner_contact_number = legal_land_owner_contact_number
        self.legal_land_owner_email_address = legal_land_owner_email_address
        self.is_legal_address_same_as_mailing_address = is_legal_address_same_as_mailing_address
        self.is_billing_address_same_as_mailing_address = is_billing_address_same_as_mailing_address
        self.is_billing_address_same_as_legal_address = is_billing_address_same_as_legal_address
        self.company_alias = company_alias

        # TODO - Turn this on when document removal is activated on the front end.
        # Get the GUIDs of the updated documents.
        # updated_document_guids = [doc.get('mine_document_guid') for doc in documents]

        # Delete deleted documents.
        # for doc in self.documents:
        #     if str(doc.mine_document_guid) not in updated_document_guids:
        #         self.mine_documents.remove(doc.mine_document)
        #         doc.mine_document.delete(commit=False)

        if applicant is not None and applicant.get('address') is not None:
            applicant_party = self.create_or_update_party(applicant, 'APP', self.applicant)
            applicant_party.save()
            self.applicant_party_guid = applicant_party.party_guid

        # Create or update Agent Party
        self.is_agent = is_agent
        if not is_agent or is_agent is None or not agent:
            # unassign the agent party guid if previously set
            self.agent_party_guid = None
        else:
            agent_party = self.create_or_update_party(agent, 'AGT', self.agent)
            agent_party.save()
            self.agent_party_guid = agent_party.party_guid

        self.facility_type = facility_type
        self.facility_desc = facility_desc
        self.facility_latitude = facility_latitude
        self.facility_longitude = facility_longitude
        self.facility_coords_source = facility_coords_source
        self.facility_coords_source_desc = facility_coords_source_desc
        self.facility_pid_pin_crown_file_no = facility_pid_pin_crown_file_no
        self.legal_land_desc = legal_land_desc
        self.facility_lease_no = facility_lease_no
        self.zoning = zoning
        self.zoning_reason = zoning_reason

        if facility_operator and facility_type:
            if not facility_operator['party_type_code']:
                facility_operator["party_type_code"] = "PER"
            fop_party = self.create_or_update_party(facility_operator, 'FOP', self.facility_operator)
            fop_party.save()
            self.facility_operator_guid = fop_party.party_guid

        self.nearest_municipality_guid = nearest_municipality

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

        # Delete deleted authorizations.
        updated_authorization_ids = [
            authorization.get('project_summary_authorization_guid')
            for authorization in authorizations
        ]
        if ams_authorizations:
            ams_auth_amend_ids = [
                authorization.get('project_summary_authorization_guid')
                for authorization in ams_authorizations.get('amendments', None)
            ]
            ams_auth_new_ids = [
                authorization.get('project_summary_authorization_guid')
                for authorization in ams_authorizations.get('new', None)
            ]
            updated_authorization_ids.extend(ams_auth_amend_ids)
            updated_authorization_ids.extend(ams_auth_new_ids)

        for deleted_authorization in self.authorizations:
            if str(deleted_authorization.project_summary_authorization_guid
                   ) not in updated_authorization_ids:
                deleted_authorization.delete(commit=False)

        # Create or update existing authorizations.
        for authorization in authorizations:
            self.create_or_update_authorization(authorization)

        if ams_authorizations:
            ams_results = []
            if self.status_code == 'SUB':
                ams_results = AMSApiService.create_new_ams_authorization(
                    ams_authorizations,
                    applicant,
                    nearest_municipality,
                    agent,
                    contacts,
                    facility_type,
                    facility_desc,
                    facility_latitude,
                    facility_longitude,
                    facility_coords_source,
                    facility_coords_source_desc,
                    legal_land_desc,
                    facility_operator,
                    legal_land_owner_name,
                    legal_land_owner_contact_number,
                    legal_land_owner_email_address,
                    is_legal_land_owner,
                    is_crown_land_federal_or_provincial,
                    is_landowner_aware_of_discharge_application,
                    has_landowner_received_copy_of_application,
                    facility_pid_pin_crown_file_no,
                    company_alias,
                    zoning,
                    zoning_reason)

            for authorization in ams_authorizations.get('amendments', []):
                self.create_or_update_authorization(authorization)

            for authorization in ams_authorizations.get('new', []):
                if ams_results:
                    ams_tracking_details = self.get_ams_tracking_details(ams_results,
                                                                         authorization.get(
                                                                             'project_summary_authorization_guid'))
                    if ams_tracking_details:
                        # if result does not have a statusCode attribute, it means the outcome is successful.
                        authorization['ams_status_code'] = ams_tracking_details.get('statusCode', '200')
                        authorization['ams_tracking_number'] = ams_tracking_details.get('trackingnumber', '0')
                        authorization['ams_outcome'] = ams_tracking_details.get('outcome', ams_tracking_details.get(
                            'errorMessage'))

                self.create_or_update_authorization(authorization)

        if add_to_session:
            self.save(commit=False)
        return self

    def delete(self, commit=True):
        for doc in self.documents:
            self.mine_documents.remove(doc.mine_document)
            doc.mine_document.delete(False)
        return super(ProjectSummary, self).delete(commit)

    def send_project_summary_email(self, mine):
        emli_recipients = PROJECT_SUMMARY_EMAILS
        cc = [MDS_EMAIL]
        minespace_recipients = [contact.email for contact in self.contacts if contact.is_primary]

        emli_body = open("app/templates/email/projects/emli_project_summary_email.html", "r").read()
        minespace_body = open("app/templates/email/projects/minespace_project_summary_email.html", "r").read()
        subject = f'Project Description Notification for {mine.mine_name}'

        emli_context = {
            "project_summary": {
                "project_summary_description": self.project_summary_description,
            },
            "mine": {
                "mine_name": mine.mine_name,
                "mine_no": mine.mine_no,
            },
            "core_project_summary_link": f'{Config.CORE_PROD_URL}/pre-applications/{self.project.project_guid}/overview'
        }

        minespace_context = {
            "mine": {
                "mine_name": mine.mine_name,
                "mine_no": mine.mine_no,
            },
            "minespace_project_summary_link": f'{Config.MINESPACE_PROD_URL}/projects/{self.project.project_guid}/overview',
            "ema_auth_link": f'{Config.EMA_AUTH_LINK}',
        }

        EmailService.send_template_email(subject, emli_recipients, emli_body, emli_context, cc=cc)
        EmailService.send_template_email(subject, minespace_recipients, minespace_body, minespace_context, cc=cc)
