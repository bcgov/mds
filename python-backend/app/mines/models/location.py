from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from .mixins import AuditMixin
from app.extensions import db


class MineLocation(AuditMixin, db.Model):
    __tablename__ = "mine_location"
    mine_location_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'), primary_key=True)
    latitude = db.Column(db.Numeric(9, 7), primary_key=True, unique=True)
    longitude = db.Column(db.Numeric(11, 7), nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return '<MineLocation %r>' % self.mine_guid

    def save(self):
        db.session.add(self)
        try:
            db.session.commit()
            return True
        except:
            db.session.rollback()
            return False

    def json(self):
        return {
            'mine_location_guid': self.mine_location_guid,
            'mine_guid': self.mine_guid,
            'latitude': self.latitude,
            'longitude': self.longitude
        }

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id).first()

    @classmethod
    def find_by_mine_location_guid(cls, _id):
        return cls.query.filter_by(mine_location_guid=_id).first()
