from sqlalchemy.schema import FetchedValue

from app.api.now_applications.now_template_transformer import transform_template_data
from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument

class NOWApplicationDocumentType(AuditMixin, Base):
    __tablename__ = 'now_application_document_type'

    now_application_document_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    now_application_document_sub_type_code = db.Column(
        db.String,
        db.ForeignKey('now_application_document_sub_type.now_application_document_sub_type_code'))
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    document_template_code = db.Column(db.String,
                                       db.ForeignKey('document_template.document_template_code'))
    document_template = db.relationship('DocumentTemplate', backref='now_application_document_type')

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def get_with_context(cls, document_type_code, context_guid):
        document_type = cls.query.get(document_type_code)
        if context_guid:
            document_type.document_template.context_primary_key = context_guid
        return document_type
    
    def transform_template_data(self, template_data, now_application):
        return transform_template_data(self.now_application_document_type_code, template_data, now_application)

    def after_template_generated(self, template_data, now_doc, now_application):
        def after_permit_generated(template_data, now_doc, now_application):
            permit_amendment = PermitAmendment.find_by_now_application_guid(
                now_application.now_application_guid)
            if not permit_amendment:
                raise Exception('No permit amendment found for this application.')

            is_draft = template_data.get('is_draft', True)
            if is_draft:
                return

            pa_doc = PermitAmendmentDocument(
                mine_guid=permit_amendment.mine_guid,
                document_manager_guid=now_doc.mine_document.document_manager_guid,
                document_name=now_doc.mine_document.document_name)
            permit_amendment.related_documents.append(pa_doc)
            permit_amendment.save()

        if self.now_application_document_type_code in ('PMT', 'PMA'):
            return after_permit_generated(template_data, now_doc, now_application)
