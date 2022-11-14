import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from werkzeug.exceptions import NotFound
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db

from .now_application_type import NOWApplicationType
from .now_application_status import NOWApplicationStatus
from .now_application_identity import NOWApplicationIdentity
from app.api.constants import *
from app.api.utils.include.user_info import User
from app.auth import get_user_is_admin

from app.api.now_submissions.models.document import Document
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.mine.models.mine_type import MineType
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions
from flask import current_app


class NOWApplication(Base, AuditMixin):
    __tablename__ = 'now_application'
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]
    _edit_key = NOW_APPLICATION_EDIT_GROUP

    now_application_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_identity = db.relationship(
        'NOWApplicationIdentity', lazy='selectin', uselist=False)
    now_application_guid = association_proxy('now_application_identity', 'now_application_guid')

    mine_guid = association_proxy('now_application_identity', 'mine_guid')
    mine_name = association_proxy('now_application_identity', 'mine.mine_name')
    mine_no = association_proxy('now_application_identity', 'mine.mine_no')
    mine_region = association_proxy('now_application_identity', 'mine.mine_region')
    now_number = association_proxy('now_application_identity', 'now_number')
    application_type_code = association_proxy('now_application_identity', 'application_type_code')
    source_permit_amendment_id = association_proxy('now_application_identity',
                                                   'source_permit_amendment_id')
    lead_inspector_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    lead_inspector = db.relationship(
        'Party',
        lazy='selectin',
        uselist=False,
        primaryjoin='Party.party_guid == NOWApplication.lead_inspector_party_guid')
    issuing_inspector_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    issuing_inspector = db.relationship(
        'Party',
        lazy='selectin',
        uselist=False,
        primaryjoin='Party.party_guid == NOWApplication.issuing_inspector_party_guid')

    now_tracking_number = db.Column(db.Integer)
    proponent_submitted_permit_number = db.Column(db.String)
    annual_summary_submitted = db.Column(db.Boolean)
    is_first_year_of_multi = db.Column(db.Boolean)
    ats_authorization_number = db.Column(db.Numeric)
    ats_project_number = db.Column(db.Numeric)
    unreclaimed_disturbance_previous_year = db.Column(db.Numeric)
    disturbance_planned_reclamation = db.Column(db.Numeric)
    original_start_date = db.Column(db.DateTime)
    notice_of_work_type_code = db.Column(
        db.String, db.ForeignKey('notice_of_work_type.notice_of_work_type_code'), nullable=False)
    notice_of_work_type = db.relationship('NOWApplicationType', lazy='joined')

    now_application_status_code = db.Column(
        db.String,
        db.ForeignKey('now_application_status.now_application_status_code'),
        nullable=False)
    previous_application_status_code = db.Column(
        db.String,
        db.ForeignKey('now_application_status.now_application_status_code'),
        nullable=True)
    status_updated_date = db.Column(db.Date, nullable=False, server_default=FetchedValue())
    status_reason = db.Column(db.String)
    last_updated_date = db.Column(db.DateTime)
    last_updated_by = db.Column(db.String)
    imported_by = db.Column(db.String)
    imported_date = db.Column(db.DateTime)
    submitted_date = db.Column(db.Date, nullable=False)
    received_date = db.Column(db.Date, nullable=False)
    verified_by_user_date = db.Column(db.Date, nullable=False)
    decision_by_user_date = db.Column(db.Date, nullable=False)
    latitude = db.Column(db.Numeric(9, 7))
    longitude = db.Column(db.Numeric(11, 7))
    gate_latitude = db.Column(db.Numeric(9, 7))
    gate_longitude = db.Column(db.Numeric(11, 7))
    property_name = db.Column(db.String)
    tenure_number = db.Column(db.String)
    other_information = db.Column(db.String)
    description_of_land = db.Column(db.String)
    application_permit_type_code = db.Column(
        db.String, db.ForeignKey('now_application_permit_type.now_application_permit_type_code'))
    proposed_start_date = db.Column(db.Date)
    proposed_end_date = db.Column(db.Date)
    directions_to_site = db.Column(db.String)
    type_of_application = db.Column(db.String)
    application_source_type_code = db.Column(
        db.String, db.ForeignKey('application_source_type_code.application_source_type_code'))
    proposed_annual_maximum_tonnage = db.Column(db.Numeric(14, 2))
    adjusted_annual_maximum_tonnage = db.Column(db.Numeric(14, 2))

    now_application_identity = db.relationship('NOWApplicationIdentity', uselist=False)

    first_aid_equipment_on_site = db.Column(db.String)
    first_aid_cert_level = db.Column(db.String)

    work_plan = db.Column(db.String)
    crown_grant_or_district_lot_numbers = db.Column(db.String)

    req_access_authorization_numbers = db.Column(db.String)
    has_surface_disturbance_outside_tenure = db.Column(db.Boolean, nullable=True)
    is_access_gated = db.Column(db.Boolean, nullable=True)
    has_key_for_inspector = db.Column(db.Boolean, nullable=True)
    has_req_access_authorizations = db.Column(db.Boolean, nullable=True)

    permit_status = db.Column(db.String)
    term_of_application = db.Column(db.Numeric(14, 0))
    is_applicant_individual_or_company = db.Column(db.String)
    relationship_to_applicant = db.Column(db.String)
    merchantable_timber_volume = db.Column(db.Numeric(14, 2))

    reviews = db.relationship('NOWApplicationReview', lazy='select', backref='now_application')

    blasting_operation = db.relationship('BlastingOperation', lazy='joined', uselist=False)
    state_of_land = db.relationship('StateOfLand', lazy='joined', uselist=False)

    # Securities
    liability_adjustment = db.Column(db.Numeric(16, 2))
    security_received_date = db.Column(db.Date)
    security_not_required = db.Column(db.Boolean)
    security_not_required_reason = db.Column(db.String)

    # Activities
    camp = db.relationship('Camp', lazy='selectin', uselist=False)
    cut_lines_polarization_survey = db.relationship(
        'CutLinesPolarizationSurvey', lazy='selectin', uselist=False)
    exploration_access = db.relationship('ExplorationAccess', lazy='selectin', uselist=False)
    exploration_surface_drilling = db.relationship(
        'ExplorationSurfaceDrilling', lazy='selectin', uselist=False)
    mechanical_trenching = db.relationship('MechanicalTrenching', lazy='selectin', uselist=False)
    placer_operation = db.relationship('PlacerOperation', lazy='selectin', uselist=False)
    sand_gravel_quarry_operation = db.relationship(
        'SandGravelQuarryOperation', lazy='selectin', uselist=False)
    settling_pond = db.relationship('SettlingPond', lazy='selectin', uselist=False)
    surface_bulk_sample = db.relationship('SurfaceBulkSample', lazy='selectin', uselist=False)
    underground_exploration = db.relationship(
        'UndergroundExploration', lazy='selectin', uselist=False)
    water_supply = db.relationship('WaterSupply', lazy='selectin', uselist=False)

    # Progress
    application_progress = db.relationship('NOWApplicationProgress', lazy='selectin', uselist=True)

    # Documents that are not associated with a review
    documents = db.relationship(
        'NOWApplicationDocumentXref',
        lazy='selectin',
        primaryjoin=
        'and_(NOWApplicationDocumentXref.now_application_id==NOWApplication.now_application_id, NOWApplicationDocumentXref.now_application_review_id==None, NOWApplicationDocumentXref.deleted_ind==False)',
        order_by='desc(NOWApplicationDocumentXref.create_timestamp)')

    application_reason_codes = db.relationship(
        'ApplicationReasonXref',
        lazy='selectin',
        uselist=True,
        primaryjoin='ApplicationReasonXref.now_application_id == NOWApplication.now_application_id')

    submission_documents = db.relationship(
        'Document',
        lazy='selectin',
        secondary=
        'join(NOWApplicationIdentity, Document, foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid))',
        primaryjoin=
        'and_(NOWApplication.now_application_id==NOWApplicationIdentity.now_application_id, foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid))',
        secondaryjoin='foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid)',
        viewonly=True,
        order_by='asc(Document.id)')

    imported_submission_documents = db.relationship(
        'NOWApplicationDocumentIdentityXref',
        lazy='selectin',
        primaryjoin=
        'and_(NOWApplicationDocumentIdentityXref.now_application_id==NOWApplication.now_application_id)',
        order_by='asc(NOWApplicationDocumentIdentityXref.create_timestamp)')

    contacts = db.relationship(
        'NOWPartyAppointment',
        lazy='selectin',
        primaryjoin=
        'and_(NOWPartyAppointment.now_application_id == NOWApplication.now_application_id, NOWPartyAppointment.deleted_ind==False)'
    )

    status = db.relationship(
        'NOWApplicationStatus',
        lazy='selectin',
        primaryjoin=
        'NOWApplication.now_application_status_code == NOWApplicationStatus.now_application_status_code'
    )

    equipment = db.relationship(
        'Equipment', secondary='activity_equipment_xref', load_on_pending=True)

    def __repr__(self):
        return '<NOWApplication %r>' % self.now_application_guid

    def get_activities(self):
        activities = [
            self.camp, self.cut_lines_polarization_survey, self.exploration_access,
            self.exploration_surface_drilling, self.mechanical_trenching, self.placer_operation,
            self.sand_gravel_quarry_operation, self.settling_pond, self.surface_bulk_sample,
            self.underground_exploration, self.water_supply
        ]
        return activities

    @hybrid_property
    def next_document_final_package_order(self):
        documents_order = [
            doc.final_package_order for doc in self.documents if doc.final_package_order is not None
        ]
        max_documents_order = max(documents_order) if documents_order else 0

        imported_submission_documents_order = [
            doc.final_package_order for doc in self.imported_submission_documents
            if doc.final_package_order is not None
        ]
        max_imported_submission_documents_order = max(
            imported_submission_documents_order) if imported_submission_documents_order else 0

        max_order = max(max_documents_order, max_imported_submission_documents_order)
        return max_order + 1

    @hybrid_property
    def total_merchantable_timber_volume(self):
        total = 0
        for activity in self.get_activities():
            if activity and activity.details:
                for detail in activity.details:
                    total += detail.timber_volume if detail.timber_volume else 0
        return total

    @hybrid_property
    def site_property(self):
        return MineType.query.filter_by(
            now_application_guid=self.now_application_guid,
            active_ind=True,
            mine_guid=self.mine_guid).one_or_none()

    @hybrid_property
    def active_permit(self):
        return PermitAmendment.query.filter_by(
            now_application_guid=self.now_application_guid,
            permit_amendment_status_code='ACT',
            deleted_ind=False).one_or_none()

    @hybrid_property
    def draft_permit(self):
        return PermitAmendment.query.filter_by(
            now_application_guid=self.now_application_guid,
            permit_amendment_status_code='DFT',
            deleted_ind=False).one_or_none()

    @hybrid_property
    def remitted_permit(self):
        return PermitAmendment.query.filter_by(
            now_application_guid=self.now_application_guid,
            permit_amendment_status_code='RMT',
            deleted_ind=False).one_or_none()

    @hybrid_property
    def permit(self):
        return self.active_permit or self.draft_permit or self.remitted_permit

    @hybrid_property
    def related_permit_guid(self):
        permit_amendment = PermitAmendment.query.filter_by(
            now_application_guid=self.now_application_guid, deleted_ind=False).first()
        return permit_amendment.permit_guid if permit_amendment else None

    @hybrid_property
    def is_new_permit(self):
        return self.type_of_application == 'New Permit'

    @hybrid_property
    def permittee(self):
        permittees = [
            contact.party for contact in self.contacts if contact.mine_party_appt_type_code == 'PMT'
        ]
        return permittees[0] if permittees else None

    @hybrid_property
    def source_permit_guid(self):
        permit_amendment = None
        if self.source_permit_amendment_id:
            permit_amendment = PermitAmendment.find_by_permit_amendment_id(
                self.source_permit_amendment_id)
        return permit_amendment.permit_guid if permit_amendment else None

    @hybrid_property
    def is_source_permit_generated_in_core(self):
        permit_amendment = None
        if self.source_permit_amendment_id:
            permit_amendment = PermitAmendment.find_by_permit_amendment_id(
                self.source_permit_amendment_id)

        return permit_amendment.is_generated_in_core if permit_amendment else False

    @classmethod
    def find_by_application_id(cls, now_application_id):
        return cls.query.filter_by(now_application_id=now_application_id).one_or_none()

    @classmethod
    def find_by_application_guid(cls, now_application_guid):
        return cls.query.filter_by(now_application_guid=now_application_guid).one_or_none()

    @classmethod
    def validate_guid(cls, guid, msg='Invalid guid.'):
        try:
            uuid.UUID(str(guid), version=4)
        except ValueError:
            raise AssertionError(msg)

    @validates('proposed_annual_maximum_tonnage')
    def validate_proposed_annual_maximum_tonnage(self, key, proposed_annual_maximum_tonnage):
        if proposed_annual_maximum_tonnage and self.proposed_annual_maximum_tonnage:
            if not get_user_is_admin(
            ) and self.proposed_annual_maximum_tonnage != proposed_annual_maximum_tonnage:
                raise AssertionError('Only admins can modify the proposed annual maximum tonnage.')
        return proposed_annual_maximum_tonnage

    def save_import_meta(self):
        self.imported_by = User().get_user_username()
        self.imported_date = datetime.utcnow()
        self.save()

    def save(self, commit=True):
        self.last_updated_by = User().get_user_username()
        self.last_updated_date = datetime.utcnow()
        super(NOWApplication, self).save(commit)

    # Generates a Notice of Work Form (NTR) document and includes it in the final application package while excluding all previous NTR documents.
    def add_now_form_to_fap(self, description):
        from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
        from app.api.now_applications.resources.now_application_export_resource import NOWApplicationExportResource
        from app.api.document_generation.resources.now_document_resource import NoticeOfWorkDocumentResource

        # Generate the Notice of Work Form document
        token = NOWApplicationExportResource.get_now_form_generate_token(self.now_application_guid)
        now_doc_dict = NoticeOfWorkDocumentResource.generate_now_document(token, True)

        # Exclude all previous Notice of Work Form documents from the final application package
        now_form_docs = [
            doc for doc in self.documents if doc.now_application_document_type_code == 'NTR'
        ]
        for doc in now_form_docs:
            doc.is_final_package = False
            doc.final_package_order = None
            doc.save()

        # Add the newly generated Notice of Work Form document to the final application package
        now_application_document_xref_guid = now_doc_dict['now_application_document_xref_guid']
        now_doc = NOWApplicationDocumentXref.find_by_guid(now_application_document_xref_guid)
        now_doc.is_final_package = True
        now_doc.final_package_order = self.next_document_final_package_order
        now_doc.description = description
        now_doc.save()

    @classmethod
    def get_filtered_submissions_documents(cls, now_application):
        docs = []

        for doc in now_application.imported_submission_documents:
            docs.append({
                'messageid':
                doc.messageid,
                'now_application_document_xref_guid':
                str(doc.now_application_document_xref_guid),
                'mine_document_guid':
                str(doc.mine_document_guid),
                'documenturl':
                doc.documenturl,
                'documenttype':
                doc.documenttype,
                'description':
                doc.description,
                'is_final_package':
                doc.is_final_package,
                'final_package_order':
                doc.final_package_order,
                'is_consultation_package':
                doc.is_consultation_package,
                'is_referral_package':
                doc.is_referral_package,
                'filename':
                doc.filename,
                'now_application_id':
                doc.now_application_id,
                'document_manager_guid':
                doc.document_manager_guid,
                'preamble_title':
                doc.preamble_title,
                'preamble_author':
                doc.preamble_author,
                'preamble_date':
                doc.preamble_date,
                'update_timestamp':
                doc.update_timestamp
            })

        for doc in now_application.submission_documents:
            imported = any(
                (imported_doc.messageid == doc.messageid and imported_doc.filename == doc.filename
                 and imported_doc.documenturl == doc.documenturl
                 and imported_doc.documenttype == doc.documenttype
                 for imported_doc in now_application.imported_submission_documents))
            if imported:
                continue
            else:
                docs.append({
                    'id': doc.id,
                    'now_application_document_xref_guid': None,
                    'mine_document_guid': None,
                    'messageid': doc.messageid,
                    'documenturl': doc.documenturl,
                    'documenttype': doc.documenttype,
                    'description': doc.description,
                    'is_final_package': False,
                    'final_package_order': None,
                    'is_referral_package': False,
                    'is_consultation_package': False,
                    'filename': doc.filename,
                    'now_application_id': now_application.now_application_id,
                    'document_manager_guid': None,
                })

        return docs