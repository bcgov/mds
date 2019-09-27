import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class MinespaceUserMine(Base):
    __tablename__ = 'minespace_user_mds_mine_access'

    user_id = db.Column(db.Integer, db.ForeignKey('minespace_user.user_id'), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), nullable=False, primary_key=True)

    @classmethod
    def create(cls, user_id, mine_guid, add_to_session=True):
        minespace_user = cls(user_id=user_id, mine_guid=mine_guid)
        if add_to_session:
            minespace_user.save(commit=False)
        return minespace_user