from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base

class MineRegionCode (AuditMixin,Base):
    __tablename__ = 'mine_region_code'
    region_code = db.Column(db.String(2), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)


    def __repr__(self):
        return '<MineRegionCode %r>' % self.region_code
     
    def json(self):
        return {
            'region_code': str(self.region_code),
            'description': str(self.description),
            'display_order': str(self.display_order)
        }
    @classmethod
    def find_by_region_code(cls,_code):
        return cls.query.filter_by(region_code=_code).first()
 
    
class MineRegion(AuditMixin,Base):
    __tablename__ = 'mine_region'
    mine_region_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    region_code = db.Column(db.String(2), db.ForeignKey('mine_region_code.region_code'))

    def __repr__(self):
        return '<Mine_Region_Guid %r>' % self.mine_region_guid
     
    def json(self): 
        region_description=MineRegionCode.find_by_region_code(self.region_code).json()
        return {
            'mine_region_guid': str(self.mine_region_guid),
            'mine_guid': str(self.mine_guid),
            'region_code': str(self.region_code),
            'region_value': str(region_description['description'])
        }

    @classmethod
    def find_by_mine_region_guid(cls, _id):
        return cls.query.filter_by(mine_region_guid=_id).first()
 
 