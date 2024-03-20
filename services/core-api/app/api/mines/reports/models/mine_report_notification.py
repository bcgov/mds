from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.api.EMLI_contacts.models.EMLI_contact import EMLIContact
from app.api.compliance.models.compliance_article import ComplianceArticle

from app.extensions import db
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db
from sqlalchemy import func, and_

# mine_report_notification (compliance_article_emli_contact_xref) table, 
# cotains the parameters that needs to decide the notifications depending on the article section and mine types
class MineReportNotification(Base):
    __tablename__ = "mine_report_notification"
    compliance_article_emli_contact_xref_guid = db.Column(UUID(as_uuid=True),
                                                  primary_key=True,
                                                  server_default=FetchedValue())
    compliance_article_id = db.Column(db.Integer, db.ForeignKey('compliance_article.compliance_article_id'))
    contact_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('emli_contact.contact_guid'))
    is_major_mine = db.Column(db.Boolean, nullable=False)
    is_regional_mine = db.Column(db.Boolean, nullable=False)

    @hybrid_property
    def emli_contact(self):
        if self.contact_guid:
            contact = EMLIContact.find_EMLI_contact_by_guid(self.contact_guid)
            return contact.email
        return None

    def __repr__(self):
        return '<mine_report_notification %r>' % self.compliance_article_emli_contact_xref_guid

    @classmethod
    def find_contact_by_compliance_article(cls, _section, _sub_section, _paragraph, _sub_paragraph):

        try:          
            if _sub_section and _paragraph and _sub_paragraph:
                condition = and_(ComplianceArticle.section == _section,
                                  ComplianceArticle.sub_section == _sub_section,
                                  ComplianceArticle.paragraph == _paragraph,
                                  ComplianceArticle.sub_paragraph == _sub_paragraph)
            elif _sub_section and _paragraph:
                condition = and_(ComplianceArticle.section == _section,
                                  ComplianceArticle.sub_section == _sub_section,
                                  ComplianceArticle.paragraph == _paragraph,
                                  ComplianceArticle.sub_paragraph == None)
            elif _sub_section:
                condition = and_(ComplianceArticle.section == _section,
                                  ComplianceArticle.sub_section == _sub_section,
                                  ComplianceArticle.paragraph == None,
                                  ComplianceArticle.sub_paragraph == None)

            query_result = db.session.query(EMLIContact.email, MineReportNotification.is_major_mine, MineReportNotification.is_regional_mine).\
                join(MineReportNotification, EMLIContact.contact_guid == MineReportNotification.contact_guid).\
                join(ComplianceArticle, ComplianceArticle.compliance_article_id == MineReportNotification.compliance_article_id).\
                filter(condition)
            results = query_result.all()

            return results

        except ValueError:
            return None
