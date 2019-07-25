from app.extensions import db

from app.api.utils.models_mixins import Base


class MineIncidentDoSubparagraph(Base):
    __tablename__ = 'mine_incident_do_subparagraph'

    mine_incident_id = db.Column(
        db.Integer, db.ForeignKey('mine_incident.mine_incident_id'), nullable=False, primary_key=True)
    compliance_article_id = db.Column(
        db.Integer, db.ForeignKey('compliance_article.compliance_article_id'), nullable=False, primary_key=True)
