import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from werkzeug.exceptions import NotFound

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

    now_tracking_number = db.Column(db.Integer)
    notice_of_work_type_code = db.Column(
        db.String, db.ForeignKey('notice_of_work_type.notice_of_work_type_code'), nullable=False)
    now_application_status_code = db.Column(
        db.String,
        db.ForeignKey('now_application_status.now_application_status_code'),
        nullable=False)
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

    first_aid_equipment_on_site = db.Column(db.String)
    first_aid_cert_level = db.Column(db.String)

    blasting_operation = db.relationship('BlastingOperation', lazy='joined', uselist=False)
    state_of_land = db.relationship('StateOfLand', lazy='joined', uselist=False)

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

    # Documents
    documents = db.relationship(
        'NOWApplicationDocumentXref', lazy='selectin'
    )
    submission_documents = db.relationship(
        'Document',
        lazy='selectin',
        secondary="join(NOWApplication, NOWApplicationIdentity, NOWApplication.now_application_id == NOWApplicationIdentity.now_application_id).join(Application, NOWApplicationIdentity.messageid == Application.messageid)",
        primaryjoin='and_(NOWApplication.now_application_id==NOWApplicationIdentity.now_application_id, NOWApplicationIdentity.messageid==Application.messageid)',
        secondaryjoin='Application.messageid==Document.messageid',
        viewonly=True)

    # Contacts
    contacts = db.relationship('NOWPartyAppointment', lazy='selectin')

    def __repr__(self):
        return '<NOWApplication %r>' % self.now_application_guid

    @classmethod
    def find_by_application_guid(cls, guid):
        cls.validate_guid(guid)
        now_application_id = NOWApplicationIdentity.filter_by(
            application_guid=guid).first().now_application_id
        if not now_application_id:
            raise NotFound('Could not find an application for this id')
        return cls.query.filter_by(now_application_id=now_application_id).first()

    @classmethod
    def find_by_application_id(cls, now_application_id):
        return cls.query.filter_by(now_application_id=now_application_id).first()

    @classmethod
    def validate_guid(cls, guid, msg='Invalid guid.'):
        try:
            uuid.UUID(str(guid), version=4)
        except ValueError:
            raise AssertionError(msg)
