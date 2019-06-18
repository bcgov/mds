from datetime import datetime
import utm

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import reconstructor
from sqlalchemy.ext.hybrid import hybrid_property

from geoalchemy2 import Geometry
from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineLocation(AuditMixin, Base):
    __tablename__ = "mine_location"
    mine_location_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    latitude = db.Column(db.Numeric(9, 7))
    longitude = db.Column(db.Numeric(11, 7))
    geom = db.Column(Geometry('POINT', 3005))
    mine_location_description = db.Column(db.String)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(
        db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineLocation %r>' % self.mine_guid

    @reconstructor
    def init_on_load(self):
        if self.latitude and self.longitude:
            try:
                self.utm_values = utm.from_latlon(self.latitude, self.longitude)
            except utm.error.OutOfRangeError:
                self.utm_values = ()

    @hybrid_property
    def utm_easting(self):
        return self.utm_values[0] if self.utm_values else None

    @hybrid_property
    def utm_northing(self):
        return self.utm_values[1] if self.utm_values else None

    @hybrid_property
    def utm_zone_number(self):
        return self.utm_values[2] if self.utm_values else None

    @hybrid_property
    def utm_zone_letter(self):
        return self.utm_values[3] if self.utm_values else None
