from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class Camp(Base, AuditMixin):
    __tablename__ = "camp"

    camp_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    camp_name = db.Column(db.String)
    camp_number_people = db.Column(db.String)
    camp_number_structures = db.Column(db.String)
    has_fuel_stored = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    has_fuel_stored_in_bulk = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    has_fuel_stored_in_barrels = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    volume_fuel_stored = db.Column(db.Integer))
    reclamation_description = db.Column(db.String)
    reclamation_cost = db.Column(db.Numeric(10,2))
    total_disturbed_area = db.Column(db.Numeric(14,2))
    total_disturbed_area_unit_type_code = db.Column(
        db.String, db.ForeignKey('unit_type.unit_type_code'))

    def __repr__(self):
        return '<Camp %r>' % self.camp_id
