from sqlalchemy.dialects.postgresql import UUID
from app.api.utils.models_mixins import Base
from app.extensions import db


class MineMapViewLocation(Base):
    """
    Read-only model that represents the mine_map database view.
    """
    __tablename__ = "mine_map_view"
    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_name = db.Column(db.String)
    mine_no = db.Column(db.String)
    latitude = db.Column(db.Numeric(9, 7), nullable=False)
    longitude = db.Column(db.Numeric(11, 7), nullable=False)

    def __repr__(self):
        return '<MineMapView %r>' % self.mine_guid

    def json(self):
        return {
            'mine_guid': str(self.mine_guid),
            'latitude': str(self.latitude),
            'longitude': str(self.longitude),
        }
