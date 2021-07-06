from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.parties.party.models.party import Party
from app.api.document_generation.models.document_template import format_letter_date

SIGNATURE_IMAGE_HEIGHT_INCHES = 0.8


class ExplosivesPermitDocumentType(AuditMixin, Base):
    __tablename__ = 'explosives_permit_document_type'

    explosives_permit_document_type_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    display_order = db.Column(db.Integer, nullable=False)
    document_template_code = db.Column(db.String,
                                       db.ForeignKey('document_template.document_template_code'))

    document_template = db.relationship(
        'DocumentTemplate', backref='explosives_permit_document_type')

    def __repr__(self):
        return f'{self.__class__.__name__} {self.explosives_permit_document_type_code}'

    @classmethod
    def get_all(cls):
        return cls.query.order_by(cls.display_order).all()

    @classmethod
    def get_with_context(cls, document_type_code, context_guid):
        document_type = cls.query.get(document_type_code)

        if context_guid:
            document_type.document_template.context_primary_key = context_guid

        return document_type

    def transform_template_data(self, template_data, explosives_permit):
        is_draft = template_data.get('is_draft', True)
        template_data['is_draft'] = is_draft

        def create_image(source, width=None, height=None):
            return {'source': source, 'width': width, 'height': height}

        def validate_issuing_inspector(explosives_permit):
            if not explosives_permit.issuing_inspector:
                raise Exception('No Issuing Inspector has been assigned')
            if not explosives_permit.issuing_inspector.signature:
                raise Exception('No signature for the Issuing Inspector has been provided')

        # Transform template data for "Explosives Storage and Use Permit" (PER)
        # TODO: Implement properly
        def transform_permit(template_data, explosives_permit):
            if not is_draft:
                validate_issuing_inspector(explosives_permit)
                template_data['images'] = {
                    'issuing_inspector_signature':
                    create_image(
                        explosives_permit.issuing_inspector.signature,
                        height=SIGNATURE_IMAGE_HEIGHT_INCHES)
                }

            return template_data

        # Transform template data for "Explosives Storage and Use Permit Letter" (LET)
        def transform_letter(template_data, explosives_permit):

            template_data['mine_name'] = explosives_permit.mine.mine_name
            template_data['mine_number'] = explosives_permit.mine.mine_no

            mine_manager = explosives_permit.mine.mine_manager
            if mine_manager is None:
                raise Exception('No Mine Manager has been assigned to this mine')
            template_data['mine_manager_name'] = mine_manager.party.name

            issuing_inspector = None
            if is_draft:
                issuing_inspector_party_guid = template_data['issuing_inspector_party_guid']
                issuing_inspector = Party.find_by_party_guid(issuing_inspector_party_guid)
                if issuing_inspector is None:
                    raise Exception('Party for Issuing Inspector not found')
            else:
                validate_issuing_inspector(explosives_permit)
                issuing_inspector = explosives_permit.issuing_inspector
            template_data['issuing_inspector_name'] = issuing_inspector.name

            mine_operator = None
            if is_draft:
                mine_operator_party_guid = template_data['mine_operator_party_guid']
                mine_operator = Party.find_by_party_guid(mine_operator_party_guid)
                if mine_operator is None:
                    raise Exception('Party for Mine Operator not found')
            else:
                mine_operator = explosives_permit.mine_operator

            if mine_operator.first_address is None:
                raise Exception('Address for Mine Operator not found')
            template_data['mine_operator_address'] = mine_operator.first_address.full
            template_data['mine_operator_name'] = mine_operator.name

            if not is_draft:
                template_data['images'] = {
                    'issuing_inspector_signature':
                    create_image(issuing_inspector.signature, height=SIGNATURE_IMAGE_HEIGHT_INCHES)
                }

            # template_data['letter_date'] = format_letter_date(template_data['letter_date'])

            permit_number = 'BC-XXXXX' if is_draft else explosives_permit.permit_number
            if permit_number is None:
                raise Exception('Explosives Permit has not been issued')
            template_data['permit_number'] = permit_number

            return template_data

        # Transform the template data according to the document type
        if self.explosives_permit_document_type_code == 'PER':
            return transform_permit(template_data, explosives_permit)
        elif self.explosives_permit_document_type_code == 'LET':
            return transform_letter(template_data, explosives_permit)

        return template_data

    # TODO: Implement properly, if needed
    def after_template_generated(self, template_data, explosives_permit_doc, explosives_permit):
        is_draft = template_data.get('is_draft', True)

        def after_permit_generated(template_data, explosives_permit_doc, explosives_permit):
            if is_draft:
                return

        if self.explosives_permit_document_type_code == 'PER':
            return after_permit_generated(template_data, explosives_permit_doc, explosives_permit)
