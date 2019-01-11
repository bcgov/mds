from datetime import datetime
import uuid

from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from geoalchemy2 import functions
import json
from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineLocation(AuditMixin, Base):
    __tablename__ = "mine_location"
    mine_location_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    latitude = db.Column(db.Numeric(9, 7), nullable=False)
    longitude = db.Column(db.Numeric(11, 7), nullable=False)
    geom = db.Column(Geometry('POINT', 3005))
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(
        db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineLocation %r>' % self.mine_guid

    def json(self):
        lat = self.latitude
        lon = self.longitude
        return {
            'mine_location_guid': str(self.mine_location_guid),
            'mine_guid': str(self.mine_guid),
            'latitude': str(lat),
            'longitude': str(lon),
        }

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id).first()

    @classmethod
    def find_by_mine_location_guid(cls, _id):
        return cls.query.filter_by(mine_location_guid=_id).first()

    @classmethod
    def create_mine_location(cls, mine, random_location, user_kwargs, save=True):
        mine_location = cls(
            mine_location_guid=uuid.uuid4(),
            mine_guid=mine.mine_guid,
            latitude=random_location.get('latitude', 0),
            longitude=random_location.get('longitude', 0),
            effective_date=datetime.today(),
            expiry_date=datetime.today(),
            **user_kwargs)
        if save:
            mine_location.save(commit=False)
        return mine_location
