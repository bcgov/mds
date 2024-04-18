from datetime import datetime
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base


class ComplianceArticle(AuditMixin, Base):
    __tablename__ = 'compliance_article'
    compliance_article_id = db.Column(db.Integer, nullable=False, primary_key=True)
    article_act_code = db.Column(
        db.String, db.ForeignKey('article_act_code.article_act_code'), nullable=False)
    section = db.Column(db.String, nullable=True)
    sub_section = db.Column(db.String, nullable=True)
    paragraph = db.Column(db.String, nullable=True)
    sub_paragraph = db.Column(db.String, nullable=True)
    description = db.Column(db.String, nullable=False)
    long_description = db.Column(db.String, nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    expiry_date = db.Column(db.DateTime)
    help_reference_link = db.Column(db.String, nullable=True)
    cim_or_cpo = db.Column(db.String, nullable=True)

    article_act = db.relationship('ArticleActCode')

    def __repr__(self):
        return '<ComplianceArticle %r>' % self.compliance_article_id

    # returns format 14.3.2 if all of section, sub_section, paragraph present, or filters out None for 14.3 or 14
    @staticmethod
    def get_compliance_article_string(compliance_details):
        return '.'.join(
            [x for x in [compliance_details.section, compliance_details.sub_section, compliance_details.paragraph] if
             x is not None])

    @classmethod
    def find_by_compliance_article_id(cls, id):
        return cls.query.filter_by(compliance_article_id=id).first()

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def create(cls,
               article_act_code,
               section,
               sub_section,
               paragraph,
               sub_paragraph,
               description,
               long_description,
               effective_date,
               expiry_date,
               help_reference_link,
               cim_or_cpo,
               add_to_session=True):

        compliance_article = cls(article_act_code=article_act_code,
                                 section=section,
                                 sub_section=sub_section,
                                 paragraph=paragraph,
                                 sub_paragraph=sub_paragraph,
                                 description=description,
                                 long_description=long_description,
                                 effective_date=effective_date,
                                 expiry_date=expiry_date,
                                 help_reference_link=help_reference_link,
                                 cim_or_cpo=cim_or_cpo)
        if add_to_session:
            compliance_article.save(commit=False)
        return compliance_article

    def update(self,
               article_act_code,
               description,
               long_description,
               effective_date,
               expiry_date,
               section=None,
               sub_section=None,
               paragraph=None,
               sub_paragraph=None,
               help_reference_link=None,
               cim_or_cpo=None,
               add_to_session=True):
        self.article_act_code = article_act_code
        self.article_act_code = article_act_code
        self.description = description
        self.long_description = long_description
        self.effective_date = effective_date
        self.expiry_date = expiry_date
        if section is not None:
            self.section = section
        if sub_section is not None:
            self.sub_section = sub_section
        if paragraph is not None:
            self.paragraph = paragraph
        if sub_paragraph is not None:
            self.sub_paragraph = sub_paragraph
        if help_reference_link is not None:
            self.help_reference_link = help_reference_link
        if cim_or_cpo is not None:
            self.cim_or_cpo = cim_or_cpo

        if add_to_session:
            self.save(commit=False)
        return self
