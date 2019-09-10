from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class MineReportDueDateType(Base, AuditMixin):
    __tablename__ = "mine_report_due_date_type"
    mine_report_due_date_type = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, server_default=FetchedValue(), nullable=False)

    def __repr__(self):
        return '<MineReportDueDateType %r>' % self.mine_report_due_date_type
