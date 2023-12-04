from sqlalchemy.schema import FetchedValue

from app.api.document_generation.models.document_template import format_letter_date
from app.api.parties.party.models.party import Party
from app.api.utils.helpers import create_image_with_aspect_ratio
from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db
from app.api.mines.exceptions.mine_exceptions import ExplosivesPermitExeption

PERMIT_SIGNATURE_IMAGE_HEIGHT_INCHES = 0.8
LETTER_SIGNATURE_IMAGE_HEIGHT_INCHES = 0.8


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
                raise ExplosivesPermitExeption("No Issuing Inspector has been assigned",
                                              status_code = 422)
            if not explosives_permit.issuing_inspector.signature:
                raise Exception('No signature for the Issuing Inspector has been provided')

        is_draft = template_data.get('is_draft', True)
        template_data['is_draft'] = is_draft

        template_data['mine_name'] = explosives_permit.mine.mine_name
        template_data['mine_number'] = explosives_permit.mine.mine_no

        issuing_inspector = None
        if is_draft:
            issuing_inspector_party_guid = template_data['issuing_inspector_party_guid']
            issuing_inspector = Party.find_by_party_guid(issuing_inspector_party_guid)
            if issuing_inspector is None:
                raise ExplosivesPermitExeption("Can't find the provided issuing inspector",
                                              status_code = 404)
        else:
            validate_issuing_inspector(explosives_permit)
            issuing_inspector = explosives_permit.issuing_inspector
        template_data['issuing_inspector_name'] = issuing_inspector.name

        mine_manager = explosives_permit.mine_manager
        if mine_manager is None:
            raise ExplosivesPermitExeption("Provided Mine Manager not found",
                                              status_code = 404)

        if mine_manager.party.first_address is None:
            raise ExplosivesPermitExeption("Mine Manager does not have an address",
                                              status_code = 422)
        template_data['mine_manager_address'] = mine_manager.party.first_address.full
        template_data['mine_manager_name'] = mine_manager.party.name

        permittee = explosives_permit.permittee
        if permittee is None:
            raise ExplosivesPermitExeption("Provided permittee not found",
                                              status_code = 404)

        if permittee.party.first_address is None:
            raise ExplosivesPermitExeption("Permittee does not have an address",
                                              status_code = 422)
        template_data['permittee_address'] = permittee.party.first_address.full
        template_data['permittee_name'] = permittee.party.name

        permit_number = 'BC-XXXXX' if is_draft else explosives_permit.permit_number
        if permit_number is None:
            raise ExplosivesPermitExeption("Explosives Permit has not been issued",
                                              status_code = 400)
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

            permittee_address = template_data['permittee_address'].replace('\n', ' ')
            template_data['permittee_address'] = permittee_address

            template_data['latitude'] = format_latitude(explosives_permit.latitude)
            template_data['longitude'] = format_longitude(explosives_permit.longitude)

            issue_date = None
            expiry_date = None
            if is_draft:
                issue_date = template_data['issue_date']
                expiry_date = template_data['expiry_date']
            else:
                issue_date = str(explosives_permit.issue_date)
                expiry_date = str(explosives_permit.expiry_date)

            template_data['issue_date'] = format_letter_date(issue_date)
            template_data['expiry_date'] = format_letter_date(expiry_date)

            if 'amendment_count' in template_data:
                amendment_info = self.get_amendment_info(template_data['amendment_count'],
                                                         issue_date)
                template_data['amendment'] = amendment_info['amendment']

            def transform_magazines(magazines):
                def get_type_label(magazine):
                    if hasattr(magazine,
                               'explosives_permit_magazine_type_code') and magazine.explosives_permit_magazine_type_code == 'EXP':
                        return 'Explosive Magazine Type'

                    elif hasattr(magazine,
                                 'explosives_permit_amendment_magazine_type_code') and magazine.explosives_permit_amendment_magazine_type_code == 'EXP':
                        return 'Explosive Magazine Type'

                    # Default return value if neither condition is met
                    else:
                        return 'Detonator Magazine Type'

                def get_quantity_label(magazine):
                    def is_explosive_type(mag):
                        if hasattr(mag,
                                   'explosives_permit_magazine_type_code') and mag.explosives_permit_magazine_type_code == 'EXP':
                            return True
                        if hasattr(mag,
                                   'explosives_permit_amendment_magazine_type_code') and mag.explosives_permit_amendment_magazine_type_code == 'EXP':
                            return True
                        return False

                    label = 'Explosive Magazine Capacity' if is_explosive_type(
                        magazine) else 'Detonator Magazine Capacity'
                    unit = 'kg' if is_explosive_type(magazine) else 'Detonators'

                    return f'{label} {magazine.quantity} {unit}'

                transformed_magazines = []
                for magazine in magazines:
                    transformed_magazine = {
                        'type_label': get_type_label(magazine),
                        'type_no': magazine.type_no,
                        'tag_no': f'Tag #{magazine.tag_no}',
                        'quantity_label': get_quantity_label(magazine),
                    }
                    transformed_magazines.append(transformed_magazine)
                return transformed_magazines

            explosive_magazines = transform_magazines(explosives_permit.explosive_magazines or [])
            detonator_magazines = transform_magazines(explosives_permit.detonator_magazines or [])
            magazines = explosive_magazines + detonator_magazines
            template_data['magazines'] = magazines

            if not is_draft:
                template_data['images'] = {
                    'issuing_inspector_signature':
                        create_image_with_aspect_ratio(
                            issuing_inspector.signature, height=PERMIT_SIGNATURE_IMAGE_HEIGHT_INCHES)
                }

            return template_data

        # Transform template data for "Explosives Storage and Use Permit Letter" (LET)
        def transform_letter(template_data, explosives_permit):
            template_data['letter_date'] = format_letter_date(template_data['letter_date'])

            if 'amendment_count' in template_data:
                amendment_info = self.get_amendment_info(template_data['amendment_count'],
                                                         template_data['issue_date'])
                template_data['amendment_with_date'] = amendment_info['amendment_with_date']

            if not is_draft:
                template_data['images'] = {
                    'issuing_inspector_signature':
                        create_image_with_aspect_ratio(
                            issuing_inspector.signature, height=LETTER_SIGNATURE_IMAGE_HEIGHT_INCHES)
                }

            return template_data

        # Transform the template data according to the document type
        if self.explosives_permit_document_type_code == 'PER':
            return transform_permit(template_data, explosives_permit)
        elif self.explosives_permit_document_type_code == 'LET':
            return transform_letter(template_data, explosives_permit)

        return template_data

    def after_template_generated(self, template_data, explosives_permit_doc, explosives_permit):
        is_draft = template_data.get('is_draft', True)

        def after_permit_generated(template_data, explosives_permit_doc, explosives_permit):
            if is_draft:
                return

        if self.explosives_permit_document_type_code == 'PER':
            return after_permit_generated(template_data, explosives_permit_doc, explosives_permit)

    @classmethod
    def get_amendment_info(self, amendment_count, issue_date):
        amendment_info_payload = {}
        amendment_info_payload['amendment'] = f'Amendment {amendment_count}'
        amendment_info_payload[
            'amendment_with_date'] = f'(Amendment {amendment_count}) issued {format_letter_date(issue_date)}'

        return amendment_info_payload
