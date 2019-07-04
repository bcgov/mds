import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class MineReport(Base):
    __tablename__ = "mine_report"
    mine_report_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_report_guid = db.Column(UUID(as_uuid=True))
    mine_report_definition_id = db.Column(
        db.Integer, db.ForeignKey('mine_report_definition.mine_report_definition_id'))
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'))
    received_date = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime, nullable=False)
    submission_year = db.Column(db.Integer)
    deleted_ind = db.Column(db.Boolean, server_default=FetchedValue(), nullable=False)

    mine_report_submissions = db.relationship('MineReportSubmission', lazy='joined')

    def __repr__(self):
        return '<MineReport %r>' % self.mine_report_guid

    @classmethod
    def create(cls,
               mine_report_definition,
               mine_guid,
               submission_year,
               permit_id=None,
               due_date=None,
               add_to_session=True):
        mine_report = cls(
            mine_report_guid=uuid.uuid4,
            mine_report_definition_id=mine_report_definition.mine_report_definition_id,
            mine_guid=mine_guid,
            submission_year=submission_year,
            permit_id=permit_id,
            due_date=due_date)
        if add_to_session:
            mine_report.save(commit=False)
        return mine_report

    @classmethod
    def find_by_mine_guid(cls, _id):
        try:
            return cls.find_by(mine_guid=_id)
        except ValueError:
            return None

    @classmethod
    def find_by_mine_report_guid(cls, _id):
        try:
            return cls.find_by(mine_report_guid=_id)
        except ValueError:
            return None
