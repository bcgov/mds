from datetime import datetime
from app.extensions import db, api
from flask_restx import fields
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

NONCOMPLIANCE_LEGISLATION_RESPONSE_MODEL = api.model(
    'noncompliance_legislation', {
        'estimated_incident_date': fields.DateTime,
        'noncompliant_description': fields.String,
        'parent_act': fields.String,
        'section': fields.String,
        'compliance_article_comments': fields.String,
    })


class NonComplianceLegislation(Base):
    __tablename__ = "noncompliance_legislation"
    __table_args__ = {
        'comment':
        'Contains the additional details about the contravention(s) relating to an issued order; i.e. estimated incident date, noncompliance description, regulations/act contravened.'
    }
    noncompliance_legislation_id = db.Column(db.Integer, primary_key=True)
    order_stop_detail_id = db.Column(db.Integer,
                                     db.ForeignKey('order_stop_detail.order_stop_detail_id'))
    estimated_incident_date = db.Column(db.DateTime)
    noncompliant_description = db.Column(db.String(10485760))
    parent_act_id = db.Column(db.Integer, db.ForeignKey('legislation_act.legislation_act_id'))
    legislation_act_section_id = db.Column(
        db.ForeignKey('legislation_act_section.legislation_act_section_id'))
    compliance_article_id = db.Column(
        db.Integer,
        db.ForeignKey('legislation_compliance_article.legislation_compliance_article_id'))

    parent_legislation_act = db.relationship("LegislationAct", lazy='joined')
    regulation_legislation_act = db.relationship(
        "LegislationAct", secondary='legislation_act_section', lazy='joined')
    regulation_legislation_act_section = db.relationship("LegislationActSection", lazy='joined')
    compliance_article = db.relationship("LegislationComplianceArticle", lazy='joined')

    parent_act = association_proxy('parent_legislation_act', 'act')
    regulation_act = association_proxy('regulation_legislation_act', 'act')
    section = association_proxy('regulation_legislation_act_section', 'section')
    compliance_article_comments = association_proxy('compliance_article', 'comments')

    def __repr__(self):
        return f'<Legislation noncompliance_legislation_id={self.noncompliance_legislation_id} >'
