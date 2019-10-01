from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class MineReportDefinitionComplianceArticleXref(Base, AuditMixin):
    __tablename__ = "mine_report_definition_compliance_article_xref"
    mine_report_definition_compliance_article_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_report_definition_id = db.Column(
        db.Integer, db.ForeignKey('mine_report_definition.mine_report_definition_id'))
    compliance_article_id = db.Column(db.Integer,
                                      db.ForeignKey('compliance_article.compliance_article_id'))

    def __repr__(self):
        return '<mine_report_definition_compliance_article_xref %r>' % self.mine_report_definition_compliance_article_xref_guid
