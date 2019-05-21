from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.utils.base_model import Base

from app.nris.models.inspection import Inspection


class Location(Base):
    __tablename__ = "location"
    location_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.order_id'), primary_key=True)
    description = db.Column(db.String(256))
    notes = db.Column(db.String(2048))
    utm_coordinates = db.Column(db.String(256))

    def __repr__(self):
        return f'<Location location_id={self.order_id}>'
