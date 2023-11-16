import uuid

from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db

from app.api.mines.mine.models.mine_disturbance_code import MineDisturbanceCode
from app.api.mines.mine.models.mine_commodity_code import MineCommodityCode


class MineTypeDetail(AuditMixin, Base):
    __tablename__ = 'mine_type_detail_xref'
    mine_type_detail_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_type_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_type.mine_type_guid'), nullable=False)
    mine_disturbance_code = db.Column(
        db.String(3), db.ForeignKey('mine_disturbance_code.mine_disturbance_code'))
    mine_commodity_code = db.Column(
        db.String(2), db.ForeignKey('mine_commodity_code.mine_commodity_code'))
    
    mine_disturbance = db.relationship('MineDisturbanceCode', lazy='select')
    mine_commodity = db.relationship('MineCommodityCode', lazy='select')

    mine_disturbance_literal = association_proxy('mine_disturbance', 'description')
    mine_commodity_literal = association_proxy('mine_commodity', 'description')

    active_ind = db.Column(db.Boolean, nullable=False, default=True)

    def __repr__(self):
        return '<MineTypeDetail %r>' % self.mine_type_detail_xref_guid

    @classmethod
    def create(cls,
               mine_type,
               mine_disturbance_code=None,
               mine_commodity_code=None,
               add_to_session=True):
        if not mine_type.mine_tenure_type:
            raise Exception('mine_tenure_type must be set before adding commodity and disturbances')
        if bool(mine_disturbance_code) == bool(mine_commodity_code):
            raise Exception(
                'MineTypeDetail must have exactly one of mine_disturbance_code, mine_commodity_code'
            )

        if mine_disturbance_code:
            mine_disturbance = MineDisturbanceCode.query.get(mine_disturbance_code)
            if not mine_disturbance or mine_type.mine_tenure_type not in mine_disturbance.tenure_types:
                raise AssertionError(
                    f'Mine Disturbance Code {mine_disturbance_code} not valid with Tenure Type {mine_type.mine_tenure_type_code}'
                )

        if mine_commodity_code:
            mine_commodity = MineCommodityCode.query.get(mine_commodity_code)
            if not mine_commodity or mine_type.mine_tenure_type not in mine_commodity.tenure_types:
                raise AssertionError(
                    f'Mine Commodity Code {mine_commodity_code} not valid with Tenure Type {mine_type.mine_tenure_type_code}'
                )

        new_mine_type_detail = cls(
            mine_disturbance_code=mine_disturbance_code,
            mine_commodity_code=mine_commodity_code,
        )
        mine_type.mine_type_detail.append(new_mine_type_detail)
        if add_to_session:
            new_mine_type_detail.save(commit=False)
        return new_mine_type_detail

    @classmethod
    def find_by_guid(cls, _id):
        uuid.UUID(_id, version=4)
        return cls.query.filter_by(mine_type_detail_xref_guid=_id).first()

    def expire_record(self, commit=True):
        self.active_ind = False
        if commit:
            self.save()