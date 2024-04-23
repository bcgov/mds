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

    @classmethod
    def find_by_mine_report_definition_compliance_article_xref_guid(cls,
                                                                    mine_report_definition_compliance_article_xref_guid):
        return cls.query.filter_by(
            mine_report_definition_compliance_article_xref_guid=mine_report_definition_compliance_article_xref_guid).first()

    @classmethod
    def create(cls,
               mine_report_definition_id,
               compliance_article_id,
               add_to_session=True):
        mine_report_definition_compliance_article_xref = cls(
            mine_report_definition_id=mine_report_definition_id,
            compliance_article_id=compliance_article_id)
        if add_to_session:
            mine_report_definition_compliance_article_xref.save(commit=False)
        return mine_report_definition_compliance_article_xref

    def update(self,
               mine_report_definition_id,
               compliance_article_id,
               add_to_session=True):
        self.mine_report_definition_id = mine_report_definition_id
        self.compliance_article_id = compliance_article_id
        if add_to_session:
            self.save(commit=False)
        return self
