import uuid

from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineType(AuditMixin, Base):
    __tablename__ = "mine_type"
    mine_type_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('mine_identity.mine_guid'),
        nullable=False
    )
    mine_tenure_type_code = db.Column(
        db.String,
        db.ForeignKey('mine_tenure_type_code.mine_tenure_type_code'),
        nullable=False
    )
    active_ind = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )
    mine_type_detail = db.relationship(
        'MineTypeDetail',
        backref='mine_type_detail_xref',
        order_by='desc(MineTypeDetail.update_timestamp)',
        lazy='joined'
    )

    def __repr__(self):
        return '<MineType %r>' % self.mine_type_guid

    def json(self):
        return {
            'mine_type_guid': str(self.mine_type_guid),
            'mine_guid': str(self.mine_guid),
            'mine_tenure_type_code': self.mine_tenure_type_code,
            'mine_type_detail': [item.json() for item in self.active(self.mine_type_detail)]
        }

    def active(self, records):
        return list(filter(lambda x: x.active_ind, records))


    @classmethod
    def create_mine_type(cls, mine_guid, mine_tenure_type_code, user_kwargs, save=True):
        mine_type = cls(
            mine_type_guid=uuid.uuid4(),
            mine_guid=mine_guid,
            mine_tenure_type_code=mine_tenure_type_code,
            **user_kwargs
        )
        if save:
            mine_type.save(commit=False)
        return mine_type

    @classmethod
    def find_by_guid(cls, _id):
        uuid.UUID(_id, version=4)
        return cls.query.filter_by(mine_type_guid=_id).first()

    @classmethod
    def expire_record(cls, record):
        record.active_ind=False
        record.save()
