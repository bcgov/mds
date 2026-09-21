from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class NoticeOfWorkTier(Base, AuditMixin):
    __tablename__ = "notice_of_work_tier"

    notice_of_work_tier_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String(50), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return f'<NoticeOfWorkTier {self.notice_of_work_tier_code}>'

    @classmethod
    def get_all(cls):
        return cls.query.order_by(cls.display_order).all()
