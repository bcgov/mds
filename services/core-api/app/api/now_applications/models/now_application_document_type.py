from sqlalchemy.schema import FetchedValue
from flask_restplus import marshal

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.mines.response_models import PERMIT_CONDITION_TEMPLATE_MODEL


class NOWApplicationDocumentType(AuditMixin, Base):
    __tablename__ = 'now_application_document_type'
    now_application_document_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
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
        def create_image(source, width=None, height=None):
            return {'source': source, 'width': width, 'height': height}

        # Transform template data for "Working Permit" (PMT) or "Working Permit for Amendment" (PMA) documents
        def transform_permit(template_data, now_application):
            if not now_application.draft_permit:
                raise Exception(f'Notice of Work has no draft permit')

            template_data['is_amendment'] = not now_application.is_new_permit
            is_draft = False
            template_data['is_draft'] = is_draft
            if True:
                template_data['images'] = {
                    'issuing_inspector_signature':
                    create_image(now_application.issuing_inspector.signature)
                }

            conditions = now_application.draft_permit.conditions
            conditions_template_data = {}
            for section in conditions:
                category_code = section.condition_category_code
                if not conditions_template_data.get(category_code):
                    conditions_template_data[category_code] = []
                section_data = marshal(section, PERMIT_CONDITION_TEMPLATE_MODEL)
                conditions_template_data[category_code].append(section_data)
            template_data['conditions'] = conditions_template_data

            return template_data

        # Transform the template data according to the document type
        if self.now_application_document_type_code in ('PMT', 'PMA'):
            return transform_permit(template_data, now_application)

        return template_data
