from datetime import datetime
import uuid

from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineType(AuditMixin, Base):
    __tablename__ = "mine_type"
    mine_type_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'), nullable=False)
    mine_tenure_type_code = db.Column(db.String, db.ForeignKey('mine_tenure_type_code.mine_tenure_type_code'), nullable=False)


    def __repr__(self):
        return '<MineType %r>' % self.mine_type_guid

    def json(self):
        return {
            'mine_type_guid': str(self.mine_type_guid),
            'mine_guid': str(self.mine_guid),
            'mine_tenure_type_code': self.mine_tenure_type_code
        }

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
