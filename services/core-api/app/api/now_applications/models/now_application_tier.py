import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base, HistoryMixin

class NOWApplicationTier(AuditMixin, Base, HistoryMixin):
    __tablename__ = 'now_application_tier'
    __versioned__ = {}

    now_application_tier_id = db.Column(db.Integer, primary_key=True)
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'), nullable=False, unique=True)
    notice_of_work_tier_code = db.Column(
        db.String(3),
        db.ForeignKey('notice_of_work_tier.notice_of_work_tier_code'),
        nullable=False)
    description = db.Column(db.String, nullable=True)

    tier = db.relationship('NoticeOfWorkTier', lazy='joined')

    @classmethod
    def create(cls,
               now_application_id,
               notice_of_work_tier_code,
               description=None,
               add_to_session=True):
        new_tier = cls(
            now_application_id=now_application_id,
            notice_of_work_tier_code=notice_of_work_tier_code,
            description=description)
        if add_to_session:
            new_tier.save(commit=False)
        return new_tier

    def __repr__(self):
        return '<NOWApplicationTier %r>' % self.now_application_tier_id
    
    @classmethod
    def find_by_id(cls, now_application_id):
        return cls.query.filter_by(now_application_id=now_application_id).one_or_none()
