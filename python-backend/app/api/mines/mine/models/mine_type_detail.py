import uuid

from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base
from app.api.constants import DISTURBANCE_CODES_CONFIG
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
        db.ForeignKey('mine_disturbance_code.mine_disturbance_code'),
        nullable=False
    )


    def __repr__(self):
        return '<MineDisturbanceCode %r>' % self.mine_disturbance_code

    def json(self):
        return {
            'mine_type_detail_guid': str(self.mine_type_detail_xref_guid),
            'mine_type_guid': str(self.mine_type_guid),
            'mine_disturbance_code': self.mine_disturbance_code
        }


    @classmethod
    def all_options(cls):
        return list(map(
            lambda x: {
                'mine_disturbance_code': x[0],
                'description': x[1],
                'mine_tenure_type_codes': DISTURBANCE_CODES_CONFIG[x[0]]['mine_tenure_type_codes'],
                'exclusive_ind': DISTURBANCE_CODES_CONFIG[x[0]]['exclusive_ind']
            },
            cls.query.with_entities(cls.mine_disturbance_code, cls.description).all()
        ))

    @classmethod
    def create_mine_type_detail(cls, mine_type_guid, mine_disturbance_code, user_kwargs, save=True):
        mine_type_detail = cls(
            mine_type_detail_xref_guid=uuid.uuid4(),
            mine_disturbance_code=mine_disturbance_code,
            mine_type_guid=mine_type_guid,
            **user_kwargs
        )
        if save:
            mine_type_detail.save(commit=False)
        return mine_type_detail
