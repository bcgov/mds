from datetime import datetime
from app.extensions import db, api
from flask_restx import fields
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base


class LegislationComplianceArticle(Base):
    __tablename__ = "legislation_compliance_article"
    __table_args__ = {
        'comment': 'Contains the long description for each provision of the parent Act and is used to describe which part of the Act/Code was found to be in noncompliance during an inspection. Data for this table was derived through the values in the compliance_article table in the NRIS database. Note, each description is related to a corresponding legislation_act_section and parent Act. I.e. For section 1.9.1 of the HSRC, the description is ""The manager shall (1) take all reasonable and practicable measures to ensure that the workplace is free of potentially hazardous agents and conditions which could adversely affect the health, safety, or well-being of the workers'}
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
