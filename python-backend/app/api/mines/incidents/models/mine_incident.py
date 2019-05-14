import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from ....utils.models_mixins import AuditMixin, Base
from .mine_incident_followup_type import MineIncidentFollowupType
from app.api.mines.incidents.models.mine_incident_determination_type import MineIncidentDeterminationType
from app.api.mines.compliance.models.compliance_article import ComplianceArticle
from app.api.mines.incidents.models.mine_incident_do_subparagraph import MineIncidentDoSubparagraph


class MineIncident(AuditMixin, Base):
    __tablename__ = 'mine_incident'

    mine_incident_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_incident_id_year = db.Column(
        db.Integer, nullable=False, default=datetime.datetime.now().year)
    mine_incident_guid = db.Column(
        UUID(as_uuid=True), nullable=False, server_default=FetchedValue())

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)

    incident_timestamp = db.Column(db.DateTime, nullable=False)
    incident_description = db.Column(db.String, nullable=False)

    reported_timestamp = db.Column(db.DateTime)
    reported_by = db.Column(db.String)
    reported_by_role = db.Column(db.String)

    determination_type_code = db.Column(
        db.String,
        db.ForeignKey('mine_incident_determination_type.mine_incident_determination_type_code'))
    followup_type_code = db.Column(
        db.String, db.ForeignKey('mine_incident_followup_type.mine_incident_followup_type_code'))
    followup_inspection_no = db.Column(db.String)

    closing_report_summary = db.Column(db.String)

    determination_type = db.relationship(
        'MineIncidentDeterminationType', backref='mine_incidents', lazy='joined', uselist=False)
    dangerous_occurrence_subparagraphs = db.relationship(
        'ComplianceArticle',
        backref='mine_incidents',
        lazy='joined',
        secondary='mine_incident_do_subparagraph')
    followup_type = db.relationship(
        'MineIncidentFollowupType', backref='mine_incidents', lazy='joined', uselist=False)

    @hybrid_property
    def mine_incident_report_no(self):
        return str(self.mine_incident_id_year) + '-' + str(self.mine_incident_id)

    @hybrid_property
    def dangerous_occurrence_subparagraph_ids(self):
        return [sub.compliance_article_id for sub in self.dangerous_occurrence_subparagraphs]

    @classmethod
    def find_by_mine_incident_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_incident_guid=_id).first()
        except ValueError:
            return None

    @classmethod
    def create(cls,
               mine,
               incident_timestamp,
               incident_description,
               determination_type_code='PEN',
               followup_type_code='UND',
               followup_inspection_no=None,
               reported_timestamp=None,
               reported_by=None,
               reported_by_role=None,
               add_to_session=True):
        mine_incident = cls(
            incident_timestamp=incident_timestamp,
            incident_description=incident_description,
            reported_timestamp=reported_timestamp,
            reported_by=reported_by,
            reported_by_role=reported_by_role,
            determination_type_code=determination_type_code,
            followup_type_code=followup_type_code,
            followup_inspection_no=followup_inspection_no,
        )
        mine.mine_incidents.append(mine_incident)
        if add_to_session:
            mine_incident.save(commit=False)
        return mine_incident

    @validates('reported_by')
    def validate_reported_by(self, key, reported_by):
        if reported_by:
            if len(reported_by) > 100:
                raise AssertionError('reported_by must not exceed 100 characters.')
        return reported_by

    @validates('reported_by_role')
    def validate_reported_by_role(self, key, reported_by_role):
        if reported_by_role:
            if len(reported_by_role) > 100:
                raise AssertionError('reported_by_role must not exceed 100 characters.')
        return reported_by_role

    @validates('followup_inspection_number')
    def validate_followup_inspection_number(self, key, followup_inspection_number):
        if followup_inspection_number:
            if len(followup_inspection_number) > 20:
                raise AssertionError('followup_inspection_number must not exceed 100 characters.')
        return followup_inspection_number

    @validates('incident_timestamp')
    def validate_incident_timestamp(self, key, incident_timestamp):
        if incident_timestamp:
            if incident_timestamp > datetime.datetime.now():
                raise AssertionError('incident_timestamp must not be in the future')
        return incident_timestamp

    @validates('reported_timestamp')
    def validate_reported_timestamp(self, key, reported_timestamp):
        if reported_timestamp:
            if reported_timestamp > datetime.datetime.now():
                raise AssertionError('reported_timestamp must not be in the future')
        return reported_timestamp