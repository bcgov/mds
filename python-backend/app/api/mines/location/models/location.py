from datetime import datetime
import uuid

from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineMapViewLocation(Base):
    """
    Read-only model that represents the mine_map database view.
    """
    __tablename__ = "mine_map_view"
    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    latitude = db.Column(db.Numeric(9, 7), nullable=False)
    longitude = db.Column(db.Numeric(11, 7), nullable=False)
    mine_no = db.Column(db.String(10))
    mine_name = db.Column(db.String(60), nullable=False)

    def __repr__(self):
        return '<MineMapView %r>' % self.mine_guid

    def json(self):
        return {
            'mine_guid': str(self.mine_guid),
            'latitude': str(self.latitude),
            'longitude': str(self.longitude),
            'mine_no': str(self.mine_no),
            'mine_name': str(self.mine_name),
        }

    def json_for_map(self):
        return {
            'guid': str(self.mine_guid),
            'mine_detail': [{'mine_name': str(self.mine_name),
                             'mine_no': str(self.mine_no)
                             }],
            'mine_location': [{'latitude': str(self.latitude),
                               'longitude': str(self.longitude)
                               }]
        }


class MineLocation(AuditMixin, Base):
    __tablename__ = "mine_location"
    mine_location_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    latitude = db.Column(db.Numeric(9, 7), nullable=False)
    longitude = db.Column(db.Numeric(11, 7), nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

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
    def create_mine_location(cls, mine_identity, random_location, user_kwargs, save=True):
        mine_location = cls(
            mine_location_guid=uuid.uuid4(),
            mine_guid=mine_identity.mine_guid,
            latitude=random_location.get('latitude', 0),
            longitude=random_location.get('longitude', 0),
            effective_date=datetime.today(),
            expiry_date=datetime.today(),
            **user_kwargs
        )
        if save:
            mine_location.save(commit=False)
        return mine_location
