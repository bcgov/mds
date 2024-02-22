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

    @classmethod
    def find_by_compliance_article_id(cls, id):
        return cls.query.filter_by(compliance_article_id=id).first()

    @classmethod
    def get_all(cls):
        return cls.query.all()