from app.extensions import db
from app.utils.models_mixins import Base


class ImportNowSubmissionDocumentsJob(Base):
    __tablename__ = 'import_now_submission_documents_job'

    import_now_submission_documents_job_id = db.Column(db.Integer, primary_key=True)

    start_timestamp = db.Column(db.DateTime)
    end_timestamp = db.Column(db.DateTime)

    create_user = db.Column(db.String)

    now_application_id = db.Column(db.Integer, nullable=False)

    import_now_submission_documents_job_status_code = db.Column(
        db.String,
        db.ForeignKey(
            'import_now_submission_documents_job_status.import_now_submission_documents_job_status_code'
        ),
        nullable=False)

    import_now_submission_documents = db.relationship(
        'ImportNowSubmissionDocument', lazy='selectin')

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.import_now_submission_documents_job_id}>'

    def json(self):
        return {
            'import_now_submission_documents_job_id':
            self.import_now_submission_documents_job_id,
            'start_timestamp':
            self.start_timestamp,
            'end_timestamp':
            self.end_timestamp,
            'create_user':
            self.create_user,
            'now_application_id':
            self.now_application_id,
            'import_now_submission_documents_job_status_code':
            self.import_now_submission_documents_job_status_code
        }

    def task_json(self):
        return {
            'import_now_submission_documents_job_id':
            self.import_now_submission_documents_job_id,
            'start_timestamp':
            self.start_timestamp,
            'end_timestamp':
            self.end_timestamp,
            'create_user':
            self.create_user,
            'now_application_id':
            self.now_application_id,
            'import_now_submission_documents_job_status_code':
            self.import_now_submission_documents_job_status_code
        }
