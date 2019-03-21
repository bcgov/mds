from datetime import datetime
import re
import uuid

from flask import request, current_app

from sqlalchemy import func
from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base
from app.api.constants import PARTY_STATUS_CODE


class Notification(AuditMixin, Base):
    __tablename__ = 'notification'
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
    def find_notifications_by_idir(cls, idir):
        #get the idir from the request header
        print(request)
        return None

        # try:
        #     return cls.query.filter_by(idir=idir)
        # except ValueError:
        #     return None

    @classmethod
    def find_notifications_by_mine_guid(cls, guid):
        try:
            return cls.query.filter_by(mine_guid=guid)
        except ValueError:
            return None


