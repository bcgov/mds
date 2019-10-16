from datetime import datetime
import uuid

from sqlalchemy.dialects.postgresql import UUID
from app.api.utils.models_mixins import AuditMixin, Base
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
            'mine_guid': str(self.mine_guid),
            'mine_name': str(self.mine_name),
            'mine_no': str(self.mine_no),
            'mine_location': {
                'latitude': str(self.latitude),
                'longitude': str(self.longitude)
            }
        }
