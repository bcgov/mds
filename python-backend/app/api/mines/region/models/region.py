from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base


class MineRegionCode(AuditMixin, Base):
    __tablename__ = 'mine_region_code'
    mine_region_code = db.Column(db.String(2), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime,
                            nullable=False,
                            default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineRegionCode %r>' % self.mine_region_code

    def json(self):
        return {
            'region_code': str(self.mine_region_code),
            'description': str(self.description),
            'display_order': str(self.display_order)
        }

    @classmethod
    def find_by_region_code(cls, _code):
        return cls.query.filter_by(mine_region_code=_code).first()

    @classmethod
    #add active_ind here when added to db
    def get_active(cls):
        return cls.query.all()

    @classmethod
    def create(cls,
               code,
               description,
               display_order,
               effective_date,
               expiry_date,
               add_to_session=True):
        mine_region_code = cls(
            mine_region_code=code,
            description=description,
            display_order=display_order,
            effective_date=effective_date,
            expiry_date=expiry_date,
        )
        if add_to_session:
            mine_region_code.save(commit=False)
        return mine_region_code
