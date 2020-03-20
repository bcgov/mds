from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from datetime import datetime
from sqlalchemy.ext.associationproxy import association_proxy
from app.extensions import db

from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.include.user_info import User


class NOWApplicationProgress(Base, AuditMixin):
    __tablename__ = "now_application_progress"

    application_progress_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))

    application_progress_status_code = db.Column(db.String, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    created_by = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<NOWApplicationProgress %r>' % self.application_progress_id

    @classmethod
    def create(cls, now_application, application_progress_status_code, add_to_session=True):

        existing_progress = next(
            (na for na in now_application.application_progress
             if na.application_progress_status_code == application_progress_status_code), None)
        if existing_progress:
            raise AssertionError(
                f'{now_application} already has application progress of {application_progress_status_code}'
            )

        progress = cls(
            application_progress_status_code=application_progress_status_code,
            start_date=datetime.utcnow(),
            created_by=User().get_user_username(),
        )
        now_application.application_progress.append(progress)
        if add_to_session:
            progress.save(commit=False)
        return progress

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()