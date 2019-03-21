import uuid, datetime

from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.utils.include.user_info import User


class MineVerifiedStatus(Base):
    __tablename__ = 'mine_verified_status'

    mine_verified_status_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    healthy_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    verifying_user = db.Column(db.String, nullable=False, default=User().get_user_username)
    verifying_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    update_user = db.Column(
        db.String(60),
        nullable=False,
        default=User().get_user_username,
        onupdate=User().get_user_username)
    update_timestamp = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.now)

    mine = db.relationship('Mine', backref='verification', lazy='joined')

    def json(self):
        return {
            'healthy': self.healthy_ind,
            'verifying_user': self.verifying_user,
            'verifying_timestamp':
            str(self.verifying_timestamp) if self.verifying_timestamp else None,
        }

    @classmethod
    def find_by_mine_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_guid=_id).first()
        except ValueError:
            return None
