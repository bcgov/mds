from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class MineReportSubmission(Base):
    __tablename__ = "mine_report_submission"
    mine_report_submission_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    mine_report_submission_guid = db.Column(UUID(as_uuid=True))
    mine_report_id = db.Column(db.Integer, db.ForeignKey('mine_report.mine_report_id'))
    mine_report_submission_status_code = db.Column(
        db.String,
        db.ForeignKey('mine_report_submission_status_code.mine_report_submission_status_code'))
    submission_date = db.Column(db.DateTime)
    active_ind = db.Column(db.Boolean, server_default=FetchedValue(), nullable=False)
    documents = db.relationship(
        'MineDocument', lazy='selectin', secondary='mine_report_document_xref')

    def __repr__(self):
        return '<MineReportSubmission %r>' % self.mine_report_submission_guid
