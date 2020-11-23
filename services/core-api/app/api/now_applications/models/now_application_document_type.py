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

        # Transform template data for "Working Permit" or "Working Permit for Amendment"
        def transform_permit(template_data, now_application):
            is_draft = False
            permit = None
            if now_application.active_permit:
                permit = now_application.active_permit
            elif now_application.draft_permit:
                permit = now_application.draft_permit
                is_draft = False
            elif now_application.remitted_permit:
                permit = now_application.remitted_permit
            else:
                raise Exception('Notice of Work has no permit')

            if not now_application.issuing_inspector:
                raise Exception('No Issuing Inspector has been assigned')
            if not now_application.issuing_inspector.signature:
                raise Exception('No signature for the Issuing Inspector has been provided')

            if not is_draft:
                template_data['images'] = {
                    'issuing_inspector_signature':
                    create_image(now_application.issuing_inspector.signature)
                }

            # NOTE: This is how the front-end is determining whether it's an amendment or not. But, is it not more correct to check permit_amendment.permit_amendment_type_code == 'AMD'?
            template_data['is_amendment'] = not now_application.is_new_permit

            template_data['is_draft'] = is_draft

            conditions = permit.conditions
            conditions_template_data = {}
            for section in conditions:
                category_code = section.condition_category_code
                if not conditions_template_data.get(category_code):
                    conditions_template_data[category_code] = []
                section_data = marshal(section, PERMIT_CONDITION_TEMPLATE_MODEL)
                conditions_template_data[category_code].append(section_data)
            template_data['conditions'] = conditions_template_data

            return template_data

        # Transform template data for "Acknowledgement Letter", "Withdrawal Letter", and "Rejection Letter"
        def transform_letter(template_data, now_application):
            if not now_application.issuing_inspector:
                raise Exception('No Issuing Inspector has been assigned')
            if not now_application.issuing_inspector.signature:
                raise Exception('No signature for the Issuing Inspector has been provided')

            template_data['images'] = {
                'issuing_inspector_signature':
                create_image(now_application.issuing_inspector.signature)
            }

            return template_data

        # Transform the template data according to the document type
        if self.now_application_document_type_code in ('PMT', 'PMA'):
            return transform_permit(template_data, now_application)
        elif self.now_application_document_type_code in ('CAL', 'WDL', 'RJL'):
            return transform_letter(template_data, now_application)

        return template_data
