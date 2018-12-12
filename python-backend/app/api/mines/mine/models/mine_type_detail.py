import uuid

from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base
from app.api.constants import DISTURBANCE_CODES_CONFIG, COMMODITY_CODES_CONFIG
from app.extensions import db


class MineTypeDetail(AuditMixin, Base):
    __tablename__ = 'mine_type_detail_xref'
    mine_type_detail_xref_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_type_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('mine_type.mine_type_guid'),
        nullable=False
    )
    mine_disturbance_code = db.Column(
        db.String(3),
        db.ForeignKey('mine_disturbance_code.mine_disturbance_code')
    )
    mine_commodity_code = db.Column(
        db.String(2),
        db.ForeignKey('mine_commodity_code.mine_commodity_code')
    )
    active_ind = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )


    def __repr__(self):
        return '<MineTypeDetail %r>' % self.mine_type_detail_xref_guid

    def json(self):
        response = {
            'mine_type_detail_guid': str(self.mine_type_detail_xref_guid),
            'mine_type_guid': str(self.mine_type_guid),
            'active_ind': self.active_ind
        }

        if self.mine_disturbance_code:
            response['mine_disturbance_code'] = self.mine_disturbance_code
        if self.mine_commodity_code:
            response['mine_commodity_code'] = self.mine_commodity_code

        return response

    def validate_disturbance_code_with_tenure(self, mine_tenure_type_code):
        assert mine_tenure_type_code in DISTURBANCE_CODES_CONFIG[self.mine_disturbance_code]['mine_tenure_type_codes']
        return mine_tenure_type_code

    def validate_commodity_code_with_tenure(self, mine_tenure_type_code):
        assert mine_tenure_type_code in COMMODITY_CODES_CONFIG[self.mine_commodity_code]['mine_tenure_type_codes']
        return mine_tenure_type_code


    @classmethod
    def create_mine_type_detail(
            cls,
            mine_type_guid,
            mine_disturbance_code,
            mine_commodity_code,
            user_kwargs,
            save=True
    ):
        mine_type_detail = cls(
            mine_type_detail_xref_guid=uuid.uuid4(),
            mine_disturbance_code=mine_disturbance_code,
            mine_commodity_code=mine_commodity_code,
            mine_type_guid=mine_type_guid,
            **user_kwargs
        )
        if save:
            mine_type_detail.save(commit=False)
        return mine_type_detail

    @classmethod
    def find_by_guid(cls, _id):
        uuid.UUID(_id, version=4)
        return cls.query.filter_by(mine_type_detail_xref_guid=_id).first()

    @classmethod
    def expire_record(cls, record):
        record.active_ind=False
        record.save()
