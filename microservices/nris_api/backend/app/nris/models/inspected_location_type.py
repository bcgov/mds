from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base


class InspectedLocationType(Base):
    __tablename__ = "inspected_location_type"
    inspected_location_type_id = db.Column(db.Integer, primary_key=True)
    inspected_location_type = db.Column(db.String(256))

    def __repr__(self):
        return f'<InspectedLocationType inspected_location_type_id={self.inspected_location_type_id} inspected_location_type={self.inspected_location_type}>'

    @classmethod
    def find_all_inspected_location_types(cls):
        return cls.query.all()
