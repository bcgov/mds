from datetime import datetime
import re
import uuid

from flask import request, current_app
from app.api.utils.include.user_info import User
from sqlalchemy import func
from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from app.extensions import db

from app.api.utils.models_mixins import  Base
from app.api.constants import PARTY_STATUS_CODE


class Notification( Base):
    __tablename__ = 'notification'
    user_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True),db.ForeignKey('mine.mine_guid'))
    idir = db.Column(db.String, nullable=False)


#TODO not sure how to implement the json method properly
    def json(self):
        result = {
            'mine_guid': str(self.mine_guid),
            'idir': str(self.idir),
        }
        return result

# search methods
    @classmethod
    def find_notifications_for_user(cls):
        user_name = User().get_user_username()

        #get the idir from the request header
        print(user_name)
        # return None

        try:
            return cls.query.filter_by(idir=user_name)
        except ValueError:
            return None

    @classmethod
    def find_notifications_by_mine_guid(cls, guid):
        user_name = User().get_user_username()

        # get the idir from the request header
        print(user_name)
        print(request)
        try:
            return cls.query.filter_by(mine_guid=guid)
        except ValueError:
            return None

    @classmethod
    def create_subscription(cls, mine_guid):
        user_name = User().get_user_username()
        if Notification.query.filter_by(mine_guid=uuid.UUID(mine_guid)).filter_by(
            idir=user_name).first() is None:
            subscription = cls(mine_guid=uuid.UUID(mine_guid), idir=user_name)
            subscription.save()
            return subscription
        return

    @classmethod
    def delete_subscription(cls, mine_guid):
        user_name = User().get_user_username()
        subscription_to_delete = Notification.query.filter_by(mine_guid=uuid.UUID(mine_guid)).filter_by(idir=user_name).first()
        current_app.logger.debug("The subscription_to_delete is: " + str(subscription_to_delete))

        db.session.delete(subscription_to_delete)
        db.session.commit()
        return

