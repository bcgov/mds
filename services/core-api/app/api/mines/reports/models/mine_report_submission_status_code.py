import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class MineReportSubmissionStatusCode(Base, AuditMixin):
    __tablename__ = "mine_report_submission_status_code"
    mine_report_submission_status_code = db.Column(db.String, primary_key=True)
    description = db.Column(UUID(as_uuid=True))
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, server_default=FetchedValue(), nullable=False)

    def __repr__(self):
        return '<MineReportSubmissionStatusCode %r>' % self.mine_report_submission_status_code

    @classmethod
    def find_by_mine_report_submission_status_code(cls, _code):
        return cls.query.filter_by(mine_report_submission_status_code=_code).first()

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()
