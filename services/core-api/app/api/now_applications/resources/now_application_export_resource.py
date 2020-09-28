import uuid
import json
from flask import request, current_app
from flask_restplus import Resource, fields, marshal
from werkzeug.exceptions import NotFound, BadRequest
from datetime import datetime
from app.api.utils.include.user_info import User

from app.extensions import api, cache
from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType
from app.api.now_applications.models.activity_summary.activity_type import ActivityType
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.include.user_info import User
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.constants import TIMEOUT_5_MINUTES, NOW_DOCUMENT_DOWNLOAD_TOKEN
from app.api.now_applications.response_models import NOW_APPLICATION_DOCUMENT_TYPE_MODEL, NOW_APPLICATION_MODEL

NOW_DOCUMENT_DOWNLOAD_TOKEN_MODEL = api.model('NoticeOfWorkDocumentDownloadToken',
                                              {'token': fields.String})


class NOWApplicationExportResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('now_application_guid', type=str, location='json', required=True)

    @api.doc(
        description=
        'Generates the specified document for the NoW using the provided template data and issues a one-time token that is used to download the document.',
        params={'document_type_code': 'The code indicating the type of document to generate.'})
    @api.marshal_with(NOW_DOCUMENT_DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_role_edit_permit
    def post(self, document_type_code):
        document_type = NOWApplicationDocumentType.query.get(document_type_code)
        if not document_type:
            raise NotFound('Document type not found')

        if not document_type.document_template:
            raise BadRequest(f'Cannot generate a {document_type.description}')

        data = self.parser.parse_args()

        now_application_identity = NOWApplicationIdentity.find_by_guid(data["now_application_guid"])

        if not now_application_identity:
            raise NotFound('Notice of Work not found')

        now_application = now_application_identity.now_application
        now_application_json = marshal(now_application, NOW_APPLICATION_MODEL)

        # data transforamtion functions
        current_app.logger.info("@@@@@@@@@@@@@@@@  DATA TRANSFORMATION  @@@@@@@@@@@@@@@@@@@@@@")

        def is_number(s):
            try:
                float(s)
                return True
            except ValueError:
                return False

        def transform_contact(contact):
            def get_address(contact):
                if not contact.party and not contact.party.address:
                    return ''
                address = contact.party.address[0]
                address_string = ''
                if address.suite_no:
                    address_string += f'{address.suite_no} '
                if address.address_line_1:
                    address_string += f'{address.address_line_1} '
                if address.address_line_2:
                    address_string += f'{address.address_line_2} '
                address_string = address_string.strip()

                if address.city or address.sub_division_code or address.post_code:
                    address_string += '\n'
                    if address.city:
                        address_string += address.city
                    if address.sub_division_code:
                        address_string += f' {address.sub_division_code}'
                    if address.post_code:
                        address_string += f' {address.post_code}'

                return address_string.strip()

            def get_phone(contact):
                if not contact.party:
                    return ''
                phone_string = contact.party.phone_no
                if contact.party.phone_ext:
                    phone_string += f' x{contact.party.phone_ext}'
                return phone_string

            contact['address'] = get_address(contact)
            contact['phone'] = get_phone(contact)

            return contact

        def transform_currency(value):
            return f'${float(value):,.2f}' if value and is_number(value) else value

        def get_reclamation_summary(now_application):

            # cut_lines_polarization_survey	Cut Lines and Induced Polarization Survey
            # water_supply	Water Supply
            # settling_pond	Settling Ponds
            # exploration_surface_drilling	Exploration Surface Drilling
            # sand_gravel_quarry_operation	Sand and Gravel / Quarry Operations
            # exploration_access	Access Roads, Trails, Helipads, Airstrips, Boat Ramps
            # underground_exploration	Underground Exploration
            # camp	Camps, Buildings, Staging Area, Fuel/Lubricant Storage
            # mechanical_trenching	Mechanical Trenching / Test Pits
            # surface_bulk_sample	Surface Bulk Sample
            # blasting_operation	Blasting Operations
            # placer_operation	Placer Operations

            activity_types = ActivityType.get_all()
            summary = []
            for activity_type in activity_types:
                if now_application.get(activity_type.activity_type_code):
                    summary.append({
                        'activity':
                        activity_type.description,
                        'total':
                        now_application[activity_type.activity_type_code].get(
                            'total_disturbed_area', '-'),
                        'cost':
                        (transform_currency(now_application[activity_type.activity_type_code].get(
                            'reclamation_cost', None)))
                    })
            return summary

        def get_render_activities(now_application):
            activity_types = ActivityType.get_all()
            render = {}
            for activity_type in activity_types:
                if now_application.get(activity_type.activity_type_code):
                    render[activity_type.activity_type_code] = True
            return render

        def transform_booleans(value):
            return 'Yes' if value else 'No'

        def transform_data(obj):
            for key in obj:
                if obj[key] is None:
                    obj[key] = '-'
                elif key == 'reclamation_cost':
                    obj[key] = transform_currency(obj[key])
                elif isinstance(obj[key], (bool)):
                    obj[key] = transform_booleans(obj[key])
                elif isinstance(obj[key], (dict)):
                    transform_data(obj[key])
            return obj

        # Data transformation
        for contact in now_application_json.get('contacts', []):
            contact = transform_contact(contact)
        now_application_json['summary'] = get_reclamation_summary(now_application_json)
        now_application_json['render'] = get_render_activities(now_application_json)
        now_application_json['exported_date_utc'] = datetime.utcnow().strftime('%Y-%m-%d %H:%M')
        now_application_json['exported_by_user'] = User().get_user_username()

        now_application_json = transform_data(now_application_json)

        current_app.logger.info("@@@@@@@@@@@@@@@@  START  @@@@@@@@@@@@@@@@@@@@@@")
        template_data = now_application_json

        # ENFORCE READ-ONLY CONTEXT DATA
        enforced_data = [
            x for x in document_type.document_template._form_spec_with_context(
                data['now_application_guid']) if x.get('read-only', False)
        ]
        for enforced_item in enforced_data:
            if template_data.get(enforced_item['id']) != enforced_item['context-value']:
                current_app.logger.debug(
                    f'OVERWRITING ENFORCED key={enforced_item["id"]}, value={template_data.get(enforced_item["id"])} -> {enforced_item["context-value"]}'
                )
            template_data[enforced_item['id']] = enforced_item['context-value']

        token = uuid.uuid4()
        # For now, we don't have a "proper" means of authorizing communication between our microservices, so this temporary solution
        # has been put in place to authorize with the document manager (pass the authorization headers into the token and re-use them
        # later). A ticket (MDS-2744) to set something else up as been created.
        cache.set(
            NOW_DOCUMENT_DOWNLOAD_TOKEN(token), {
                'document_type_code': document_type_code,
                'now_application_guid': data['now_application_guid'],
                'template_data': template_data,
                'username': User().get_user_username(),
                'authorization_header': request.headers['Authorization']
            }, TIMEOUT_5_MINUTES)

        current_app.logger.debug(json.dumps(template_data))
        current_app.logger.info("@@@@@@@@@@@@@@@@  END  @@@@@@@@@@@@@@@@@@@@@@")

        return {'token': token}