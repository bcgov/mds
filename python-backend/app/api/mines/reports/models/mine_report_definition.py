from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class MineReportDefinition(Base):
    __tablename__ = "mine_report_definition"
    mine_report_definition_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    mine_report_definition_guid = db.Column(UUID(as_uuid=True), nullable=False)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    compliance_article_id = db.Column(
        db.Integer, db.ForeignKey('compliance_article.compliance_article_id'), nullable=False)
    due_date_period_months = db.Column(db.Integer, nullable=False)
    mine_report_due_date_type = db.Column(
        db.String,
        db.ForeignKey('mine_report_due_date_type.mine_report_due_date_type'),
        nullable=False)
    active_ind = db.Column(db.Boolean, server_default=FetchedValue(), nullable=False)
    categories = db.relationship(
        'MineReportCategory', lazy='selectin', secondary='mine_report_category_xref')

    def __repr__(self):
        return '<MineReportDefinition %r>' % self.mine_report_definition_guid
