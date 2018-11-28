from datetime import datetime
import uuid

from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineType(AuditMixin, Base):
    __tablename__ = "mine_type"
    mine_type_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), nullable=False)
    mine_tenure_type_id = db.Column(db.SmallInteger)

    def __repr__(self):
        return '<MineType %r>' % self.mine_type_guid

    # TODO: Do I even need this method for anything?
    @classmethod
    def create_mine_type(cls, mine_guid, mine_tenure_type_id, user_kwargs, save=True):
        mine_type = cls(
            mine_type_guid=uuid.uuid4(),
            mine_guid=mine_guid,
            mine_tenure_type_id=mine_tenure_type_id,
            **user_kwargs
        )
        if save:
            mine_type.save(commit=False)
        return mine_type
