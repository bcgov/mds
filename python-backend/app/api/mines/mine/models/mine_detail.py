from datetime import datetime
import uuid

from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base
from ...region.models.region import MineRegionCode
from .mine_type import MineType
from app.extensions import db


class MineDetail(AuditMixin, Base):
    __tablename__ = "mine_detail"
    mine_detail_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    mine_no = db.Column(db.String(10))
    mine_name = db.Column(db.String(60), nullable=False)
    mine_note = db.Column(db.String(300), default='')
    major_mine_ind = db.Column(db.Boolean, nullable=False, default=False)
    mine_region = db.Column(db.String(2), db.ForeignKey('mine_region_code.mine_region_code'))


    def __repr__(self):
        return '<MineDetail %r>' % self.mine_guid

    def json(self):
        return {
            'mine_name': self.mine_name,
            'mine_no': self.mine_no,
            'mine_note': self.mine_note,
            'major_mine_ind': self.major_mine_ind,
            'region_code': self.mine_region
            }

    @classmethod
    def find_by_mine_no(cls, _id):
        return cls.query.filter_by(mine_no=_id).first()

    @classmethod
    def create_mine_detail(cls, mine_identity, mine_no, mine_name, mine_category, mine_region, user_kwargs, save=True):
        mine_detail = cls(
            mine_detail_guid=uuid.uuid4(),
            mine_guid=mine_identity.mine_guid,
            mine_no=mine_no,
            mine_name=mine_name,
            major_mine_ind =mine_category,
            mine_region =mine_region,
            **user_kwargs
        )
        if save:
            mine_detail.save(commit=False)
        return mine_detail

    @validates('mine_name')
    def validate_mine_name(self, key, mine_name):
        if not mine_name:
            raise AssertionError('No mine name provided.')
        if len(mine_name) > 60:
            raise AssertionError('Mine name must not exceed 60 characters.')
        return mine_name

    @validates('mine_note')
    def validate_mine_note(self, key, mine_note):
        if len(mine_note) > 300:
            raise AssertionError('Mine note must not exceed 300 characters.')
        return mine_note

    @validates('mine_no')
    def validate_mine_no(self, key, mine_no):
        if len(mine_no) > 10:
            raise AssertionError('Mine number must not exceed 10 characters.')
        return mine_no

