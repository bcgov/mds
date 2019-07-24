from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class MineReportComment(Base, AuditMixin):
    __tablename__ = "mine_report_comment"
    mine_report_comment_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_report_comment_guid = db.Column(UUID(as_uuid=True), nullable=False)
    mine_report_id = db.Column(db.Integer, db.ForeignKey('mine_report.mine_report_id'))
    mine_report_submission_id = db.Column(
        db.Integer, db.ForeignKey('mine_report_submission.mine_report_submission_id'))
    minespace_user_id = db.Column(db.Integer, db.ForeignKey('minespace_user.user_id'))
    core_user_id = db.Column(db.Integer, db.ForeignKey('core_user.core_user_id'))
    comment = db.Column(db.String, nullable=False)
    comment_visibility = db.Column(db.Boolean, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    submission_year = db.Column(db.Integer)
    deleted_ind = db.Column(db.Boolean, server_default=FetchedValue(), nullable=False)

    mine_report_submissions = db.relationship('MineReportSubmission', lazy='joined')

    def __repr__(self):
        return '<MineReportComment %r>' % self.mine_report_comment_guid
