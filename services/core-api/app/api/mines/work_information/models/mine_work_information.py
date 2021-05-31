from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import nullsfirst, nullslast

from app.api.utils.models_mixins import AuditMixin, Base
from app.api.utils.include.user_info import User
from app.extensions import db


class MineWorkInformation(AuditMixin, Base):
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

    # TODO: Implement
    @hybrid_property
    def work_status(self):
        work_status = "Unknown"
        today = datetime.utcnow().date
        return work_status

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(
            mine_guid=mine_guid, deleted_ind=False).order_by(
                nullsfirst(cls.work_stop_date.desc()), nullslast(cls.work_start_date.desc())).all()

    @classmethod
    def find_by_mine_work_information_guid(cls, mine_work_information_guid):
        return cls.query.filter_by(
            mine_work_information_guid=mine_work_information_guid, deleted_ind=False).order_by(
                nullsfirst(cls.work_stop_date.desc()),
                nullslast(cls.work_start_date.desc())).one_or_none()
