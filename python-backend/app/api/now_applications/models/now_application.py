from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db

import app.api.now_applications.models.activity_summary
import app.api.now_applications.models.activity_detail

from .now_application_type import NOWApplicationType
from .now_application_status import NOWApplicationStatus


class NOWApplication(Base, AuditMixin):
    __tablename__ = "now_application"

    now_application_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_guid = db.Column(UUID(as_uuid=True))
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    now_message_id = db.Column(db.Integer, nullable=False)
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
    proposed_start_date = db.Column(db.Date)
    proposed_end_date = db.Column(db.Date)

    # Activities
    camps = db.relationship('Camp', lazy='selectin', uselist=False)
    cut_lines_polarization_survey = db.relationship(
        'CutLinesPolarizationSurvey', lazy='selectin', uselist=False)
    exploration_surface_drilling = db.relationship(
        'ExplorationSurfaceDrilling', lazy='selectin', uselist=False)
    mechanical_trenching = db.relationship('MechanicalTrenching', lazy='selectin', uselist=False)
    placer_operation = db.relationship('PlacerOperation', lazy='selectin', uselist=False)
    blasting = db.relationship('BlastingOperation', lazy='selectin', uselist=False)
    sand_and_gravel = db.relationship('SandGravelQuarryOperation', lazy='selectin', uselist=False)
    surface_bulk_sample = db.relationship('SurfaceBulkSample', lazy='selectin', uselist=False)
    water_source_activites = db.relationship('WaterSupply', lazy='selectin', uselist=False)
    exploration_access = db.relationship('ExplorationAccess', lazy='selectin', uselist=False)
    settling_pond = db.relationship('SettlignPond', lazy='selectin', uselist=False)
    underground_exploration = db.relationship(
        'UndergroundExploration', lazy='selectin', uselist=False)

    def __repr__(self):
        return '<NOWApplication %r>' % self.now_application_guid
