from datetime import datetime
from app.extensions import db, api
from flask_restplus import fields
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base


class LegislationComplianceArticle(Base):
    __tablename__ = "legislation_compliance_article"
    legislation_compliance_article_id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.Integer)
    comments = db.Column(db.String())

    def __repr__(self):
        return f'<LegislationComplianceArticle legislation_compliance_article_id={self.legislation_compliance_article_id}>'

    @classmethod
    def find_all_legislation_compliance_articles(cls):
        return cls.query.all()

    @classmethod
    def find_legislation_compliance_article_by_external_id(cls, _external_id):
        return cls.query.filter_by(external_id=_external_id).first()
