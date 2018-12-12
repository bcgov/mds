from app.extensions import db
from ....utils.models_mixins import AuditMixin, Base


class RequiredDocumentDueDateType(AuditMixin, Base):
    __tablename__ = 'required_document_due_date_type'
    req_document_due_date_type = db.Column(
        db.String(3), nullable=False, primary_key=True)
    req_document_due_date_description = db.Column(
        db.String(60), nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, default=True)

    def json(self):
        return {
            'req_document_due_date_type':
            str(self.req_document_due_date_type),
            'req_document_due_date_description':
            str(self.req_document_due_date_description),
        }