from datetime import datetime
import uuid
import utm

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property, hybrid_method

from geoalchemy2 import Geometry
from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db, cache


class MineLocation(AuditMixin, Base):
    __tablename__ = "mine_location"
    mine_location_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    latitude = db.Column(db.Numeric(9, 7))
    longitude = db.Column(db.Numeric(11, 7))
    geom = db.Column(Geometry('POINT', 3005))
    mine_location_description = db.Column(db.String, nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(
        db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineLocation %r>' % self.mine_guid

    @hybrid_method
    def get_utm(self):
        if self.latitude and self.longitude:
            utm_easting, utm_northing, utm_zone_number, utm_zone_letter = utm.from_latlon(self.latitude, self.longitude)
            return utm_easting, utm_northing, utm_zone_number
