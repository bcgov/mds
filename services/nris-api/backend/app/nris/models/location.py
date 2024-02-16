from datetime import datetime
from app.extensions import db, api
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base
from flask_restx import fields

LOCATION_RESPONSE_MODEL = api.model(
    'location', {
        'description': fields.String,
        'notes': fields.String,
        'latitude': fields.String,
        'longitude': fields.String,
        'utm_easting': fields.String,
        'utm_northing': fields.String,
        'zone_number': fields.String,
        'zone_letter': fields.String,
    })


class Location(Base):
    __tablename__ = "location"
    __table_args__ = {
        'comment':
        'Contains the location details of stops added for General Observations and Areas Inspected. Location may include a general mine location or specific location details of where the infraction took place (i.e. tailings dam)'
    }
    location_id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(10485760))
    notes = db.Column(db.String)
    latitude = db.Column(db.String(16))
    longitude = db.Column(db.String(16))
    utm_easting = db.Column(db.String(16))
    utm_northing = db.Column(db.String(16))
    zone_number = db.Column(db.String(8))
    zone_letter = db.Column(db.String(8))

    def __repr__(self):
        return f'<Location location_id={self.location_id}>'
