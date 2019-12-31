from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import Base
from sqlalchemy.ext.associationproxy import association_proxy


class MineIncidentCategoryXref(Base):
    __tablename__ = 'mine_incident_category_xref'
    mine_incident_id = db.Column(
        db.Integer, db.ForeignKey('mine_incident.mine_incident_id'), primary_key=True)
    mine_incident_category_code = db.Column(
        db.String(3),
        db.ForeignKey('mine_incident_category.mine_incident_category_code'),
        primary_key=True)
