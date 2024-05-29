from datetime import datetime

from cerberus import Validator
import json

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.projects.project_summary.models.project_summary_authorization_type import ProjectSummaryAuthorizationType
from app.api.projects.project_summary.models.project_summary_permit_type import ProjectSummaryPermitType
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.projects.project_summary.models.project_summary_authorization_document_xref import ProjectSummaryAuthorizationDocumentXref

class ProjectSummaryAuthorization(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'project_summary_authorization'

    project_summary_authorization_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    existing_permits_authorizations = db.Column(db.ARRAY(db.String), nullable=False)
    project_summary_guid = db.Column(
        db.ForeignKey('project_summary.project_summary_guid'), nullable=False)
    project_summary_permit_type = db.Column(db.ARRAY(db.String), nullable=False)
    project_summary_authorization_type = db.Column(
        db.ForeignKey('project_summary_authorization_type.project_summary_authorization_type'),
        nullable=False)
    amendment_changes = db.Column(db.ARRAY(db.String), nullable=True)
    amendment_severity = db.Column(db.String, nullable=True)
    is_contaminated = db.Column(db.Boolean, nullable=True)
    new_type = db.Column(db.String, nullable=True)
    authorization_description = db.Column(db.String, nullable=True)
    exemption_requested = db.Column(db.Boolean, nullable=True)
    ams_tracking_number = db.Column(db.String, nullable=True)
    ams_outcome = db.Column(db.String, nullable=True)
    ams_status_code = db.Column(db.String, nullable=True)
    ams_submission_timestamp = db.Column(
        db.DateTime, nullable=True, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_summary_authorization_guid}'

    amendment_documents = db.relationship(
        'ProjectSummaryAuthorizationDocumentXref',
        lazy='select',
        primaryjoin='and_(ProjectSummaryAuthorizationDocumentXref.project_summary_authorization_guid == ProjectSummaryAuthorization.project_summary_authorization_guid, ProjectSummaryAuthorizationDocumentXref.mine_document_guid == MineDocument.mine_document_guid, MineDocument.is_archived == False)'
    )

    @classmethod
    def validate_ams_authorization_type(cls, authorization_type):
        ams_auth_types = str(ProjectSummaryAuthorizationType.get_by_group_id('ENVIRONMENTAL_MANAGMENT_ACT'))
        return authorization_type in ams_auth_types

    @classmethod
    def validate_authorization(cls, authorization, is_ams):
        valid_permit_types = list(map(lambda type: type.project_summary_permit_type, ProjectSummaryPermitType.get_all()))
        ams_auth_types = ProjectSummaryAuthorizationType.get_by_group_id('ENVIRONMENTAL_MANAGMENT_ACT')
        ams_auth_types_list = list(map(lambda auth_type: auth_type.project_summary_authorization_type, ams_auth_types))

        # for "OTHER_LEGISLATION"
        other_schema = {
            'project_summary_authorization_guid': {
                'type': 'string'
            },
            'authorization_description': {
                'required': True,
                'type': 'string',
                'maxlength': 100
            },
            'project_summary_guid': {
                'type': 'string',
                'nullable': True,
            },
            'project_summary_authorization_type': {
                'required': True,
                'type': 'string'
            }
        }
        # all other authorizations
        common_schema = {
            'project_summary_authorization_guid': {
                'type': 'string'
            },
            'existing_permits_authorizations': {
                'type': 'list',
                'schema': {'type': 'string'},
                'nullable': True,
            },
            'project_summary_guid': {
                'type': 'string',
                'nullable': True,
            },
            'project_summary_permit_type': {
                'required': True,
                'type': 'list',
                'allowed': valid_permit_types
            },
            'project_summary_authorization_type': {
                'required': True,
                'type': 'string'
            }
        }
        # all AMS authorizations
        common_ams_schema = common_schema | {
            'project_summary_permit_type': {
                'required': True,
                'type': 'list',
                'items': [{
                    'type': 'string',
                    'allowed': ['AMENDMENT', 'NEW']
                }]
            },
            'authorization_description': {
                'required': True,
                'type': 'string',
                'maxlength': 4000
            },
            'exemption_requested': {
                'required': True,
                'type': 'boolean'
            },
            'project_summary_authorization_type': {
                'required': True,
                'type': 'string',
                'allowed': ams_auth_types_list
            }
        }

        ams_amendment_schema = common_ams_schema | {
            'existing_permits_authorizations': {
                'required': True,
                'type': 'list',
                'schema': {'type': 'string'},
                'items': [{
                    'required': True,
                    'type': 'string',
                    'regex': '^[\d]{2,6}$'
                }]
            },
            'amendment_severity': {
                'required': True,
                'type': 'string',
                'allowed': ['SIG', 'MIN']
            },
            'amendment_changes': {
                'required': True,
                'type': 'list',
                'allowed': ['ILT', 'IGT', 'DDL', 'NAM', 'TRA', 'MMR', 'RCH', 'OTH']
            },
            'is_contaminated': {
                'required': True,
                'type': 'boolean'
            }
        }
        ams_new_schema = common_ams_schema | {
            'new_type': {
                'required': True,
                'type': 'string',
                'allowed': ['PER', 'APP']
            }
        }

        v = Validator(common_schema, purge_unknown=True)
        if is_ams:    
            permit_type = authorization.get('project_summary_permit_type')

            if not permit_type or not isinstance(permit_type, list) or not permit_type[0]:
                return f'Invalid authorization type {permit_type}'
            if permit_type[0] == 'AMENDMENT':
                v = Validator(ams_amendment_schema, purge_unknown=True)
            elif permit_type[0] == 'NEW':
                v = Validator(ams_new_schema, purge_unknown=True)
            else:
                v = Validator(common_ams_schema, purge_unknown=True)        
        elif authorization.get('project_summary_authorization_type') == 'OTHER':
            v = Validator(other_schema, purge_unknown=True)

        if not v.validate(authorization):
            return json.dumps(v.errors)
        return True

    @classmethod
    def create(cls,
               project_summary_guid,
               project_summary_permit_type,
               existing_permits_authorizations,
               amendment_changes,
               amendment_severity,
               is_contaminated,
               new_type,
               authorization_description,
               exemption_requested,
               mine,
               ams_tracking_number=None,
               ams_outcome=None,
               ams_status_code=None,
               add_to_session=True,
               amendment_documents=[]):

        new_authorization = cls(
            project_summary_guid=project_summary_guid,
            project_summary_permit_type=project_summary_permit_type,
            existing_permits_authorizations=existing_permits_authorizations,
            amendment_changes=amendment_changes,
            amendment_severity=amendment_severity,
            is_contaminated=is_contaminated,
            new_type=new_type,
            authorization_description=authorization_description,
            exemption_requested=exemption_requested,
            ams_tracking_number=ams_tracking_number,
            ams_outcome=ams_outcome,
            ams_status_code=ams_status_code,
            amendment_documents=amendment_documents)
        if add_to_session:
            new_authorization.save(commit=False)
        return new_authorization

    def update(self, 
               existing_permits_authorizations, 
               amendment_changes,
               amendment_severity,
               is_contaminated,
               new_type,
               authorization_description,
               exemption_requested,
               ams_tracking_number=None,
               ams_outcome=None,
               ams_status_code=None,
               add_to_session=True,
               amendment_documents=[]):
        self.existing_permits_authorizations = existing_permits_authorizations
        self.amendment_changes = amendment_changes
        self.amendment_severity = amendment_severity
        self.is_contaminated = is_contaminated
        self.new_type = new_type
        self.authorization_description = authorization_description
        self.exemption_requested = exemption_requested
        self.ams_tracking_number = ams_tracking_number
        self.ams_outcome = ams_outcome
        self.ams_status_code=ams_status_code
        self.amendment_documents=amendment_documents
        if add_to_session:
            self.save(commit=True)
        return self

    def delete(self, commit=True):
        return super(ProjectSummaryAuthorization, self).delete(commit)

    @classmethod
    def find_by_project_summary_authorization_guid(cls, project_summary_authorization_guid):
        return cls.query.filter_by(
            project_summary_authorization_guid=project_summary_authorization_guid,
            deleted_ind=False).one_or_none()

    @classmethod
    def find_by_project_summary_guid(cls, project_summary_guid):
        return cls.query.filter_by(
            project_summary_guid=project_summary_guid, deleted_ind=False).all()
