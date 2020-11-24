from app.extensions import db
from app.utils.models_mixins import Base


class ImportNowSubmissionDocumentsJobStatus(Base):
    __tablename__ = 'import_now_submission_documents_job_status'

    import_now_submission_documents_job_status_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.import_now_submission_documents_job_status_code}>'
