import uuid
from app.api.utils.include.user_info import User
from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates

from app.extensions import db
from app.api.utils.models_mixins import Base


class Subscription(Base):
    __tablename__ = 'subscription'
    subscription_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    user_name = db.Column(db.String, nullable=False)

    mine = db.relationship("Mine", order_by='desc(Mine.mine_name)', lazy='joined')

    def __repr__(self):
        return '<Subscription %r>' % self.subscription_id

    @classmethod
    def find_subscription_for_current_user_by_id(cls, mine_guid):
        user_name = User().get_user_username()
        return Subscription.query.filter_by(mine_guid=mine_guid).filter_by(
            user_name=user_name).first()

    @classmethod
    def create_for_current_user(cls, mine_guid, add_to_session=True):
        user_name = User().get_user_username()
        subscription = cls(mine_guid=mine_guid, user_name=user_name)
        if add_to_session:
            subscription.save(commit=False)
        return subscription

    @validates('mine_guid')
    def validate_mine_guid(self, key, mine_guid):
        if not mine_guid:
            raise AssertionError('Missing mine_guid')
        return mine_guid
