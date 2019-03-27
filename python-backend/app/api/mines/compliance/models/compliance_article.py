from datetime import datetime
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base
from sqlalchemy.schema import FetchedValue


class ComplianceArticle(AuditMixin, Base):
    __tablename__ = 'compliance_article'
    compliance_article_id = db.Column(db.Integer, nullable=False, primary_key=True)
    article_act_code = db.Column(db.String(5), nullable=False)
    section = db.Column(db.String(6), nullable=True)
    sub_section = db.Column(db.String(4), nullable=True)
    paragraph = db.Column(db.String(4), nullable=True)
    sub_paragraph = db.Column(db.String(4), nullable=True)
    description = db.Column(db.String(100), nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<ComplianceArticle %r>' % self.compliance_article_id


    @classmethod
    def all_options(cls):
        return list(map(
            lambda x: {
                'compliance_article_id': x[0],
                'article_act_code': x[1],
                'section': x[2],
                'sub_section': x[3],
                'paragraph': x[4],
                'sub_paragraph': x[5],
                'description': x[6],
                'effective_date': x[7].isoformat(),
                'expiry_date': x[8].isoformat()
            },
            cls.query
               .with_entities(cls.compliance_article_id,
                              cls.article_act_code,
                              cls.section,
                              cls.sub_section,
                              cls.paragraph,
                              cls.sub_paragraph,
                              cls.description,
                              cls.effective_date,
                              cls.expiry_date)
               .all()
        ))
