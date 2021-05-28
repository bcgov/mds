from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import AuditMixin, Base
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

    deleted_ind = db.Column(db.Boolean)

    created_by = db.Column(db.String, nullable=False)
    created_timestamp = db.Column(db.DateTime, nullable=False)
    updated_by = db.Column(db.String, nullable=False)
    updated_timestamp = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.mine_work_information_id}>'

    # TODO: Implement
    @hybrid_property
    def work_status(self):
        work_status = "Unknown"
        today = datetime.utcnow().date
        return work_status
