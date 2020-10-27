from app.extensions import db
from app.utils.models_mixins import Base


class ImportNowSubmissionDocument(Base):
    __tablename__ = 'import_now_submission_document'

    import_now_submission_document_id = db.Column(db.Integer, primary_key=True)

    import_now_submission_documents_job_id = db.Column(
        db.Integer,
        db.ForeignKey('import_now_submission_documents_job.import_now_submission_documents_job_id'),
        nullable=False)

    document_id = db.Column(db.Integer, db.ForeignKey('document.document_id'))

    submission_document_id = db.Column(db.Integer, nullable=False)
    submission_document_url = db.Column(db.String, nullable=False)
    submission_document_file_name = db.Column(db.String, nullable=False)

    error = db.Column(db.String)

    document = db.relationship('Document', lazy='selectin')

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.import_now_submission_document_id}>'

    def json(self):
        return {
            'import_now_submission_document_id': self.import_now_submission_document_id,
            'import_now_submission_documents_job_id': self.import_now_submission_documents_job_id,
            'document_id': self.document_id,
            'submission_document_id': self.submission_document_id,
            'submission_document_url': self.submission_document_url,
            'submission_document_file_name': self.submission_document_file_name,
            'error': self.error
        }

    def task_json(self):
        return {
            'import_now_submission_document_id': self.import_now_submission_document_id,
            'import_now_submission_documents_job_id': self.import_now_submission_documents_job_id,
            'document_id': self.document_id,
            'submission_document_id': self.submission_document_id,
            'submission_document_url': self.submission_document_url,
            'submission_document_file_name': self.submission_document_file_name,
            'error': self.error
        }
