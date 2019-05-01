import uuid, datetime

from sqlalchemy.orm import validates, backref
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
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
    verifying_timestamp = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    update_user = db.Column(
        db.String(60),
        nullable=False,
        default=User().get_user_username,
        onupdate=User().get_user_username)
    update_timestamp = db.Column(
        db.DateTime, nullable=False, server_default=FetchedValue(), onupdate=datetime.datetime.now)

    mine = db.relationship(
        'Mine',
        backref=backref("verified_status", uselist=False, lazy='joined'),
        lazy='select',
        uselist=False)

    @hybrid_property
    def mine_name(self):
        return self.mine.mine_name

    def json(self):
        return {
            'mine_guid': str(self.mine_guid),
            'mine_name': self.mine.mine_name,
            'healthy': self.healthy_ind,
            'verifying_user': self.verifying_user,
            'verifying_timestamp': str(self.verifying_timestamp)
        }

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        try:
            uuid.UUID(mine_guid, version=4)
            return cls.query.filter_by(mine_guid=mine_guid).first()
        except ValueError:
            return None

    @classmethod
    def find_by_user_id(cls, user_id):
        return cls.query.filter_by(verifying_user=user_id).all()
