from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class UndergroundExploration(Base, AuditMixin):
    __tablename__ = "underground_exploration"

    underground_exploration_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    total_ore_amount = db.Column(db.Integer)
    total_ore_amount_unit_type_code = db.Column(db.String,
                                                db.ForeignKey('unit_type.unit_type_code'))
    total_waste_amount = db.Column(db.Integer)
    total_waste_amount_unit_type_code = db.Column(db.String,
                                                  db.ForeignKey('unit_type.unit_type_code'))
    reclamation_description = db.Column(db.String)
    reclamation_cost = db.Column(db.Numeric(10, 2))
    total_disturbed_area = db.Column(db.Numeric(14, 2))
    total_disturbed_area_unit_type_code = db.Column(db.String,
                                                    db.ForeignKey('unit_type.unit_type_code'))

    def __repr__(self):
        return '<UndergroundExploration %r>' % self.mechanical_trenching_id
