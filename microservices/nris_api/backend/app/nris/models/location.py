from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.inspection import Inspection


class Location(Base):
    __tablename__ = "location"
    location_id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(1024))
    notes = db.Column(db.String())
    latitude = db.Column(db.String(16))
    longitude = db.Column(db.String(16))
    utm_easting = db.Column(db.String(16))
    utm_northing = db.Column(db.String(16))
    zone_number = db.Column(db.String(8))
    zone_letter = db.Column(db.String(8))

    def __repr__(self):
        return f'<Location location_id={self.order_id}>'
