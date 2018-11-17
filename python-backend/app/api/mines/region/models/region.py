from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base


class MineRegionCode (AuditMixin,Base):
    __tablename__ = 'mine_region_code'
    mine_region_code = db.Column(db.String(2), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))



    def __repr__(self):
        return '<MineRegionCode %r>' % self.mine_region_code
     
    def json(self):
        return {
            'region_code': str(self.mine_region_code),
            'description': str(self.description),
            'display_order': str(self.display_order)
        }
    @classmethod
    def find_by_region_code(cls,_code):
        return cls.query.filter_by(mine_region_code=_code).first()