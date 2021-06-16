from datetime import datetime
from pytz import timezone

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy import and_, case

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.utils.include.user_info import User
from app.extensions import db


class MineWorkInformation(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_work_information'

    mine_work_information_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    mine_work_information_guid = db.Column(
        UUID(as_uuid=True), server_default=FetchedValue(), nullable=False)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)

    work_start_date = db.Column(db.Date)
    work_stop_date = db.Column(db.Date)
    work_comments = db.Column(db.String)

    deleted_ind = db.Column(db.Boolean, server_default=FetchedValue(), nullable=False)

    created_by = db.Column(db.String, default=User().get_user_username, nullable=False)
    created_timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_by = db.Column(db.String, default=User().get_user_username, nullable=False)
    updated_timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.mine_work_information_id}>'

    def save(self):
        self.updated_by = User().get_user_username()
        self.updated_timestamp = datetime.utcnow()
        super(MineWorkInformation, self).save()

    @hybrid_property
    def work_status(self):
        today = datetime.now(timezone('US/Pacific')).date()
        start = self.work_start_date
        stop = self.work_stop_date

        if start is None and stop is None:
            return "Unknown"

        if start and stop is None:
            if today < start:
                return "Unknown"
            return "Working"

        if start is None and stop:
            if today < stop:
                return "Unknown"
            return "Not Working"

        if today < start:
            return "Not Working"

        if today > stop:
            return "Not Working"

        return "Working"

    @work_status.expression
    def work_status(cls):
        today = datetime.now(timezone('US/Pacific')).date()
        start = cls.work_start_date
        stop = cls.work_stop_date
        return case([(and_(start == None, stop == None), "Unknown"),
                     (and_(start != None, stop
                           == None), case([(today < start, "Unknown")], else_="Working")),
                     (and_(start == None,
                           stop != None), case([(today < stop, "Unknown")], else_="Not Working")),
                     (today < start, "Not Working"), (today > stop, "Not Working")],
                    else_="Working")

    @validates('work_start_date')
    def validate_work_start_date(self, key, work_start_date):
        if work_start_date and self.work_stop_date and work_start_date > self.work_stop_date:
            raise AssertionError('Work start date cannot be after the work stop date.')
        return work_start_date

    @validates('work_stop_date')
    def validate_work_start_date(self, key, work_stop_date):
        if work_stop_date and self.work_start_date and work_stop_date < self.work_start_date:
            raise AssertionError('Work stop date cannot be before the work start date.')
        return work_stop_date

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(
            mine_guid=mine_guid, deleted_ind=False).order_by(cls.created_timestamp.desc()).all()

    @classmethod
    def find_by_mine_work_information_guid(cls, mine_work_information_guid):
        return cls.query.filter_by(
            mine_work_information_guid=mine_work_information_guid,
            deleted_ind=False).order_by(cls.created_timestamp.desc()).one_or_none()
