from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db

from app.api.utils.include.user_info import User
from datetime import datetime
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission


class MineReportComment(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "mine_report_comment"
    mine_report_comment_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_report_comment_guid = db.Column(UUID(as_uuid=True), nullable=False)
    mine_report_submission_id = db.Column(
        db.Integer, db.ForeignKey('mine_report_submission.mine_report_submission_id'))
    minespace_user_id = db.Column(db.Integer, db.ForeignKey('minespace_user.user_id'))
    core_user_id = db.Column(db.Integer, db.ForeignKey('core_user.core_user_id'))
    report_comment = db.Column(db.String, nullable=False)
    comment_visibility_ind = db.Column(db.Boolean, nullable=False)

    comment_user = db.Column(db.String(60), nullable=False, default=User().get_user_username)
    comment_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return '<MineReportComment %r>' % self.mine_report_comment_guid

    @classmethod
    def create(cls,
               submission,
               mine_report_comment_guid,
               report_comment,
               comment_visibility_ind,
               add_to_session=True):
        new_comment = cls(
            mine_report_comment_guid=mine_report_comment_guid,
            report_comment=report_comment,
            comment_visibility_ind=comment_visibility_ind)
        submission.comments.append(new_comment)

        if add_to_session:
            new_comment.save(commit=False)
        return new_comment

    @classmethod
    def find_by_guid(cls, _id):
        return cls.query.filter_by(mine_report_comment_guid=_id).filter_by(
            deleted_ind=False).first()

    @classmethod
    def find_by_report_submission_id(cls, _id):
        return cls.query.filter_by(mine_report_submission_id=_id).filter_by(deleted_ind=False).all()

    @classmethod
    def find_public_by_report_submission_id(cls, _id):
        return cls.query.filter_by(mine_report_submission_id=_id).filter_by(
            deleted_ind=False).filter_by(comment_visibility_ind=True).all()

    def json(self):
        return {
            'mine_report_comment_id': self.mine_report_comment_id,
            'mine_report_comment_guid': str(self.mine_report_comment_guid),
            'mine_report_submission_id': self.mine_report_submission_id,
            'minespace_user_id': self.minespace_user_id,
            'core_user_id': self.core_user_id,
            'report_comment': self.report_comment,
            'comment_visibility_ind': str(self.comment_visibility_ind)
        }
