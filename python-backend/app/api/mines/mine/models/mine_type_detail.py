import uuid

from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineTypeDetail(AuditMixin, Base):
    __tablename__ = 'mine_type_detail_xref'
    mine_type_detail_xref_guid = db.Column(UUID(as_uuid=True),
                                           primary_key=True,
                                           server_default=FetchedValue())
    mine_type_guid = db.Column(UUID(as_uuid=True),
                               db.ForeignKey('mine_type.mine_type_guid'),
                               nullable=False)
    mine_disturbance_code = db.Column(db.String(3),
                                      db.ForeignKey('mine_disturbance_code.mine_disturbance_code'))
    mine_commodity_code = db.Column(db.String(2),
                                    db.ForeignKey('mine_commodity_code.mine_commodity_code'))

    active_ind = db.Column(db.Boolean, nullable=False, default=True)

    def __repr__(self):
        return '<MineTypeDetail %r>' % self.mine_type_detail_xref_guid

    @classmethod
    def create(cls,
               mine_type,
               mine_disturbance_code=None,
               mine_commodity_code=None,
               add_to_session=True):
        if bool(mine_disturbance_code) == bool(mine_commodity_code):
            raise Exception(
                'MineTypeDetail must have exactly one of mine_disturbance_code, mine_commodity_code'
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

    def expire_record(self):
        self.active_ind = False
        self.save()
