import uuid
from app.api.utils.include.user_info import User
from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import  Base


class Subscription( Base):
    __tablename__ = 'subscription'
    subscription_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True),db.ForeignKey('mine.mine_guid'))
    idir = db.Column(db.String, nullable=False)

    def __repr__(self):
        return '<Subscription %r>' % self.user_id

    @classmethod
    def find_subscription(cls, mine_guid):
        user_name = User().get_user_username()
        return Subscription.query.filter_by(mine_guid=uuid.UUID(mine_guid)).filter_by(
            idir=user_name).first()

    @classmethod
    def create_subscription(cls, mine_guid):
        user_name = User().get_user_username()
        subscription = cls(mine_guid=uuid.UUID(mine_guid), idir=user_name)
        subscription.save()
        return subscription
