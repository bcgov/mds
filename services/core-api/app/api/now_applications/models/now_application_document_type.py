from sqlalchemy.schema import FetchedValue
from flask_restplus import marshal

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.mines.response_models import PERMIT_CONDITION_TEMPLATE_MODEL
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument

SIGNATURE_IMAGE_HEIGHT_INCHES = 0.8


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
        def create_image(source, width=None, height=None):
            return {'source': source, 'width': width, 'height': height}

        def validate_issuing_inspector(now_application):
            if not now_application.issuing_inspector:
                raise Exception('No Issuing Inspector has been assigned')
            if not now_application.issuing_inspector.signature:
                raise Exception('No signature for the Issuing Inspector has been provided')

        # Transform template data for "Working Permit" (PMT) or "Working Permit for Amendment" (PMA)
        def transform_permit(template_data, now_application):
            is_draft = False
            permit = None
            if now_application.active_permit:
                permit = now_application.active_permit
            elif now_application.draft_permit:
                permit = now_application.draft_permit
                is_draft = template_data.get('is_draft', True)
            elif now_application.remitted_permit:
                permit = now_application.remitted_permit
            else:
                raise Exception('Notice of Work has no permit')

            validate_issuing_inspector(now_application)

            if not is_draft:
                template_data['images'] = {
                    'issuing_inspector_signature':
                    create_image(
                        now_application.issuing_inspector.signature,
                        height=SIGNATURE_IMAGE_HEIGHT_INCHES)
                }

            # NOTE: This is how the front-end is determining whether it's an amendment or not. But, is it not more correct to check permit_amendment.permit_amendment_type_code == 'AMD'?
            template_data['is_amendment'] = not now_application.is_new_permit

            template_data['is_draft'] = is_draft

            template_data['latitude'] = str(now_application.latitude)
            template_data['longitude'] = str(now_application.longitude)
            template_data['mine_name'] = now_application.mine_name

            # If amendment, get sum total security adjustment
            if not now_application.is_new_permit:
                permit_amendment = PermitAmendment.find_by_now_application_guid(
                    now_application.now_application_guid)
                associated_permit = Permit.find_by_permit_id(
                    permit_amendment.mine_permit_xref.permit_id)
                total_liability = float(now_application.liability_adjustment or 0) + float(
                    associated_permit.assessed_liability_total or 0)
            else:
                total_liability = float(now_application.liability_adjustment or 0)

            template_data['security_adjustment'] = '${:,.2f}'.format(
                total_liability) if total_liability else '$0.00'

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

        # Transform template data for "Acknowledgement Letter" (CAL), "Withdrawal Letter" (WDL), "Rejection Letter" (RJL), and "Permit Enclosed Letter" (NPE)
        def transform_letter(template_data, now_application):
            validate_issuing_inspector(now_application)

            template_data['images'] = {
                'issuing_inspector_signature':
                create_image(
                    now_application.issuing_inspector.signature,
                    height=SIGNATURE_IMAGE_HEIGHT_INCHES)
            }

            return template_data

        # Transform the template data according to the document type
        if self.now_application_document_type_code in ('PMT', 'PMA'):
            return transform_permit(template_data, now_application)
        elif self.now_application_document_type_code in ('CAL', 'WDL', 'RJL', 'NPE', 'NPI', 'NPR'):
            return transform_letter(template_data, now_application)

        return template_data

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
