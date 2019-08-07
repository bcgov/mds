from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class MineReportComment(Base, AuditMixin):
    __tablename__ = "mine_report_comment"
    mine_report_comment_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    mine_report_comment_guid = db.Column(UUID(as_uuid=True), nullable=False)
    mine_report_id = db.Column(
        db.Integer, db.ForeignKey('mine_report.mine_report_id'))
    mine_report_submission_id = db.Column(
        db.Integer, db.ForeignKey(
            'mine_report_submission.mine_report_submission_id'))
    minespace_user_id = db.Column(
        db.Integer, db.ForeignKey('minespace_user.user_id'))
    core_user_id = db.Column(
        db.Integer, db.ForeignKey('core_user.core_user_id'))
    comment = db.Column(db.String, nullable=False)
    comment_visibility_ind = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return '<MineReportComment %r>' % self.mine_report_comment_guid

    @classmethod
    def create(cls,
               report,
               submission,
               mine_report_comment_guid,
               minespace_user_id,
               core_user_id,
               comment,
               comment_visibility_ind,
               add_to_session=True):
        new_comment = cls(
            mine_report_comment_guid=mine_report_comment_guid,
            minespace_user_id=minespace_user_id,
            core_user_id=core_user_id,
            comment=comment,
            comment_visibility_ind=comment_visibility_ind
        )
        report.report_comments.append(new_comment)
        submission.submission_comments.append(new_comment)

        if add_to_session:
            new_comment.save(commit=False)
        return new_comment

    @classmethod
    def find_by_report_id(cls, _id):
        return cls.query.filter_by(mine_report_id=_id).all()

    @classmethod
    def find_public_by_report_id(cls, _id):
        return cls.query.filter_by(mine_report_id=_id).filter_by(comment_visibility_ind=True).all()
