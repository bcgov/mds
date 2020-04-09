import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from werkzeug.exceptions import NotFound
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db

from .now_application_type import NOWApplicationType
from .now_application_status import NOWApplicationStatus
from .now_application_identity import NOWApplicationIdentity
from app.api.constants import *

from app.api.now_submissions.models.document import Document


class NOWApplication(Base, AuditMixin):
    __tablename__ = "now_application"
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

    lead_inspector_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    lead_inspector = db.relationship('Party', lazy='selectin', uselist=False)

    now_tracking_number = db.Column(db.Integer)
    notice_of_work_type_code = db.Column(
        db.String, db.ForeignKey('notice_of_work_type.notice_of_work_type_code'), nullable=False)
    notice_of_work_type = db.relationship('NOWApplicationType', lazy='joined')

    now_application_status_code = db.Column(
        db.String,
        db.ForeignKey('now_application_status.now_application_status_code'),
        nullable=False)
    status_updated_date = db.Column(db.Date, nullable=False, server_default=FetchedValue())
    submitted_date = db.Column(db.Date, nullable=False)
    received_date = db.Column(db.Date, nullable=False)
    latitude = db.Column(db.Numeric(9, 7))
    longitude = db.Column(db.Numeric(11, 7))
    property_name = db.Column(db.String)
    tenure_number = db.Column(db.String)
    description_of_land = db.Column(db.String)
    application_permit_type_code = db.Column(
        db.String, db.ForeignKey('now_application_permit_type.now_application_permit_type_code'))
    proposed_start_date = db.Column(db.Date)
    proposed_end_date = db.Column(db.Date)
    directions_to_site = db.Column(db.String)
    type_of_application = db.Column(db.String)

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

    ready_for_review_date = db.Column(db.Date)
    referral_closed_on_date = db.Column(db.Date)
    consultation_closed_on_date = db.Column(db.Date)
    public_comment_closed_on_date = db.Column(db.Date)
    reviews = db.relationship('NOWApplicationReview', lazy='select', backref='now_application')

    blasting_operation = db.relationship('BlastingOperation', lazy='joined', uselist=False)
    state_of_land = db.relationship('StateOfLand', lazy='joined', uselist=False)

    # Securities
    security_total = db.Column(db.Numeric(16, 2))
    security_received_date = db.Column(db.Date)

    # Activities
    camps = db.relationship('Camp', lazy='selectin', uselist=False)
    cut_lines_polarization_survey = db.relationship(
        'CutLinesPolarizationSurvey', lazy='selectin', uselist=False)
    exploration_access = db.relationship('ExplorationAccess', lazy='selectin', uselist=False)
    exploration_surface_drilling = db.relationship(
        'ExplorationSurfaceDrilling', lazy='selectin', uselist=False)
    exploration_access = db.relationship('ExplorationAccess', lazy='selectin', uselist=False)
    mechanical_trenching = db.relationship('MechanicalTrenching', lazy='selectin', uselist=False)
    placer_operation = db.relationship('PlacerOperation', lazy='selectin', uselist=False)
    sand_and_gravel = db.relationship('SandGravelQuarryOperation', lazy='selectin', uselist=False)
    settling_pond = db.relationship('SettlingPond', lazy='selectin', uselist=False)
    surface_bulk_sample = db.relationship('SurfaceBulkSample', lazy='selectin', uselist=False)
    underground_exploration = db.relationship(
        'UndergroundExploration', lazy='selectin', uselist=False)
    water_supply = db.relationship('WaterSupply', lazy='selectin', uselist=False)
    application_progress = db.relationship('NOWApplicationProgress', lazy='selectin', uselist=True)

    # Documents that are not associated with a review
    documents = db.relationship(
        'NOWApplicationDocumentXref',
        lazy='selectin',
        primaryjoin=
        'and_(NOWApplicationDocumentXref.now_application_id==NOWApplication.now_application_id, NOWApplicationDocumentXref.now_application_review_id==None)'
    )
    submission_documents = db.relationship(
        'Document',
        lazy='selectin',
        secondary=
        "join(NOWApplicationIdentity, Document, foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid))",
        primaryjoin=
        'and_(NOWApplication.now_application_id==NOWApplicationIdentity.now_application_id, foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid))',
        secondaryjoin='foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid)',
        viewonly=True)

    # Contacts
    contacts = db.relationship('NOWPartyAppointment', lazy='selectin')

    @hybrid_property
    def permittee_name(self):
        return [
            contact.party.name for contact in self.contacts
            if contact.mine_party_appt_type_code == 'PMT'
        ][0]

    def __repr__(self):
        return '<NOWApplication %r>' % self.now_application_guid

    @classmethod
    def find_by_application_id(cls, now_application_id):
        return cls.query.filter_by(now_application_id=now_application_id).first()

    @classmethod
    def validate_guid(cls, guid, msg='Invalid guid.'):
        try:
            uuid.UUID(str(guid), version=4)
        except ValueError:
            raise AssertionError(msg)
