import datetime

from app.extensions import db
from app.utils.models_mixins import Base

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property


class ImportNowSubmissionDocumentsJob(Base):
    __tablename__ = 'import_now_submission_documents_job'

    import_now_submission_documents_job_id = db.Column(db.Integer, primary_key=True)
    start_timestamp = db.Column(db.DateTime)
    end_timestamp = db.Column(db.DateTime)
    create_timestamp = db.Column(db.DateTime)
    complete_timestamp = db.Column(db.DateTime)
    attempt = db.Column(db.Integer, nullable=False, server_default=FetchedValue())
    create_user = db.Column(db.String)
    celery_task_id = db.Column(db.String)
    now_application_id = db.Column(db.Integer, nullable=False)
    now_application_guid = db.Column(UUID(as_uuid=True), nullable=False)

    import_now_submission_documents_job_status_code = db.Column(
        db.String,
        db.ForeignKey(
            'import_now_submission_documents_job_status.import_now_submission_documents_job_status_code'
        ),
        nullable=False,
        server_default=FetchedValue())

    import_now_submission_documents = db.relationship(
        'ImportNowSubmissionDocument', lazy='selectin')

    @hybrid_property
    def next_attempt_timestamp(self):
        from app.tasks.import_now_submission_documents import RETRY_DELAYS
        if self.import_now_submission_documents_job_status_code == "DEL":
            return self.end_timestamp + datetime.timedelta(seconds=RETRY_DELAYS[self.attempt - 1])
        return None

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.import_now_submission_documents_job_id}>'

    @classmethod
    def find_by_now_application_guid(cls, now_application_guid):
        return cls.query.filter_by(now_application_guid=now_application_guid).order_by(
            cls.import_now_submission_documents_job_id).all()
