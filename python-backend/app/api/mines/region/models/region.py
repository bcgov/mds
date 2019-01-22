from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from geoalchemy2 import Geometry
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

    @classmethod
    def create_mine_region_code(cls,code,description,display_order, effective_date, expiry_date, user_kwargs, save=True):
        mine_region_code = cls(
            mine_region_code=code,
            description=description,
            display_order=display_order,
            effective_date=effective_date,
            expiry_date=expiry_date,
            **user_kwargs
        )
        if save:
            mine_region_code.save(commit=False)
        return mine_region_code

class MineRegionPoly (AuditMixin,Base):
    __tablename__ = 'mine_region_poly'
    mine_region_poly_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_region_code = db.Column(db.String(2), db.ForeignKey('mine_region_code.mine_region_code'), nullable=False)
    mine_region_poly_ha = db.Column(db.BigInteger, nullable=True)
    geom = db.Column(Geometry('MultiPolygon', 3005))

    def __repr__(self):
        return '<MineRegionPoly %r>' % self.mine_region_poly
     
    def json(self):
        return {
            'mine_region_poly_guid': str(self.mine_region_poly_guid),
            'mine_region_code': str(self.mine_region_code),
            'mine_region_poly_ha': str(self.mine_region_poly_ha),
            'geom': str(self.geom)
        }
    @classmethod
    def find_by_region_code(cls,_code):
        return cls.query.filter_by(mine_region_code=_code).first()

    @classmethod
    def create_mine_region_poly(cls,code,ha,geom,save=True):
        mine_region_code = cls(
            mine_region_code=code,
            mine_region_poly_ha=ha,
            geom='SRID=3005;MultiPolygon(%s)' % ('0106000020BD0B00000100000001030000000100000080CF0000C3F5283CF68637412DB29DAFE94F2A41B6F3FDD40987374193180496E24F2A414E6210F81B87374196438B2CF34F2A41A4703DAA2F873741B81E85ABEE4F2A41B29DEFC7428737415839B408E34F2A417593188455873741AC1C5A24D54F2A41355EBA49688')
        )
        if save:
            mine_region_poly.save(commit=False)
        return mine_region_poly
