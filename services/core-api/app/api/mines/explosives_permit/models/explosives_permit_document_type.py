from flask import current_app
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
        def validate_issuing_inspector(explosives_permit):
            if not explosives_permit.issuing_inspector:
                raise Exception('No Issuing Inspector has been assigned')
            if not explosives_permit.issuing_inspector.signature:
                raise Exception('No signature for the Issuing Inspector has been provided')

        def create_image(source, width=None, height=None):
            return {'source': source, 'width': width, 'height': height}

        is_draft = template_data.get('is_draft', True)
        template_data['is_draft'] = is_draft

        template_data['mine_name'] = explosives_permit.mine.mine_name
        template_data['mine_number'] = explosives_permit.mine.mine_no

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

        permit_number = 'BC-XXXXX' if is_draft else explosives_permit.permit_number
        if permit_number is None:
            raise Exception('Explosives Permit has not been issued')
        template_data['permit_number'] = permit_number

        # Transform template data for "Explosives Storage and Use Permit" (PER)
        def transform_permit(template_data, explosives_permit):
            def format_latitude(latitude):
                cardinal_direction = 'N'
                if latitude < 0:
                    cardinal_direction = 'S'
                return f'{str(abs(latitude)).rstrip("0").rstrip(".")} {cardinal_direction}'

            def format_longitude(longitude):
                cardinal_direction = 'E'
                if longitude < 0:
                    cardinal_direction = 'W'
                return f'{str(abs(longitude)).rstrip("0").rstrip(".")} {cardinal_direction}'

            mine_operator_address = template_data['mine_operator_address'].replace('\n', ' ')
            template_data['mine_operator_address'] = mine_operator_address

            template_data['latitude'] = format_latitude(explosives_permit.latitude)
            template_data['longitude'] = format_longitude(explosives_permit.longitude)

            issue_date = None
            expiry_date = None
            if is_draft:
                issue_date = template_data['issue_date']
                expiry_date = template_data['expiry_date']
            else:
                issue_date = explosives_permit.issue_date
                expiry_date = explosives_permit.expiry_date

            # TODO: Format dates
            template_data['issue_date'] = issue_date
            template_data['expiry_date'] = expiry_date

            # TODO: Finish implementing
            def transform_magazines(magazines):
                def get_type_label(magazine):
                    return 'Explosive Magazine Type' if magazine.explosives_permit_magazine_type_code == 'EXP' else 'Detonator Magazine Type'

                def get_quantity_label(magazine):
                    label = 'Explosive Magazine Capacity' if magazine.explosives_permit_magazine_type_code == 'EXP' else 'Detonator Magazine Capacity'
                    unit = 'kgs' if magazine.explosives_permit_magazine_type_code == 'EXP' else 'units'
                    return f'{label} {magazine.quantity} {unit}'

                transformed_magazines = []
                for magazine in magazines:
                    transformed_magazine = {
                        'type_label': get_type_label(magazine),
                        'type_no': magazine.type_no,
                        'tag_no': magazine.tag_no,
                        'quantity_label': get_quantity_label(magazine),
                    }
                    transformed_magazines.append(transformed_magazine)
                return transformed_magazines

            explosive_magazines = transform_magazines(explosives_permit.explosive_magazines or [])
            detonator_magazines = transform_magazines(explosives_permit.detonator_magazines or [])
            magazines = explosive_magazines + detonator_magazines
            template_data['magazines'] = magazines

            return template_data

        # Transform template data for "Explosives Storage and Use Permit Letter" (LET)
        def transform_letter(template_data, explosives_permit):

            # template_data['letter_date'] = format_letter_date(template_data['letter_date'])

            mine_manager = explosives_permit.mine.mine_manager
            if mine_manager is None:
                raise Exception('No Mine Manager has been assigned to this mine')
            template_data['mine_manager_name'] = mine_manager.party.name

            return template_data

        # Transform the template data according to the document type
        if self.explosives_permit_document_type_code == 'PER':
            return transform_permit(template_data, explosives_permit)
        elif self.explosives_permit_document_type_code == 'LET':
            return transform_letter(template_data, explosives_permit)

        current_app.logger.info(f'*************************************************')
        current_app.logger.info(f'{template_data}')

        return template_data

    # TODO: Implement properly, if needed
    def after_template_generated(self, template_data, explosives_permit_doc, explosives_permit):
        is_draft = template_data.get('is_draft', True)

        def after_permit_generated(template_data, explosives_permit_doc, explosives_permit):
            if is_draft:
                return

        if self.explosives_permit_document_type_code == 'PER':
            return after_permit_generated(template_data, explosives_permit_doc, explosives_permit)
