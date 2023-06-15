import uuid
import json
from flask import request, current_app
from flask_restplus import Resource, fields, marshal
from werkzeug.exceptions import NotFound, BadRequest
from datetime import datetime

from app.extensions import api, cache
from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType
from app.api.now_applications.models.now_application_type import NOWApplicationType
from app.api.now_applications.models.now_application_permit_type import NOWApplicationPermitType
from app.api.now_applications.models.activity_summary.activity_type import ActivityType
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.unit_type import UnitType
from app.api.now_applications.models.activity_detail.underground_exploration_type import UndergroundExplorationType
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.include.user_info import User
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.now_applications.transmogrify_now import transmogrify_now
from app.api.constants import TIMEOUT_5_MINUTES, NOW_DOCUMENT_DOWNLOAD_TOKEN
from app.api.now_applications.response_models import NOW_APPLICATION_DOCUMENT_TYPE_MODEL, NOW_APPLICATION_MODEL_EXPORT
from app.date_time_helper import get_duration_text

NOW_DOCUMENT_DOWNLOAD_TOKEN_MODEL = api.model('NoticeOfWorkDocumentDownloadToken',
                                              {'token': fields.String})

EMPTY_FIELD = '-'
NOT_APPLICABLE_FIELD = 'N/A'

CURRENCY_FIELDS = ['reclamation_cost']

EXCLUDED_APPLICATION_DOCUMENT_TYPES = []

ORIGINAL_NOW_FIELD_PATHS = [
    'property_name',
    'mine_no',
    'mine_region',
    'latitude',
    'description_of_land',
    'longitude',
    'work_plan',
    'type_of_application',
    'notice_of_work_type_code',
    'application_permit_type_code',
    'proposed_start_date',
    'is_first_year_of_multi',
    'crown_grant_or_district_lot_numbers',
    'proposed_end_date',
    'tenure_number',
    'directions_to_site',
    'has_req_access_authorizations',
    'has_surface_disturbance_outside_tenure',
    'req_access_authorization_numbers',
    'is_access_gated',
    'other_information',
    'has_key_for_inspector',
    'unreclaimed_disturbance_previous_year',
    'original_start_date',
    'disturbance_planned_reclamation',
    'proponent_submitted_permit_number',
    'state_of_land.notice_served_to_private',
    'state_of_land.present_land_condition_description',
    'state_of_land.means_of_access_description',
    'state_of_land.physiography_description',
    'state_of_land.old_equipment_description',
    'state_of_land.has_community_water_shed',
    'state_of_land.type_of_vegetation_description',
    'state_of_land.has_activity_in_park',
    'state_of_land.is_on_private_land',
    'state_of_land.is_on_crown_land',
    'state_of_land.has_auth_lieutenant_gov_council',
    'state_of_land.has_fn_cultural_heritage_sites_in_area',
    'state_of_land.fn_engagement_activities',
    'state_of_land.cultural_heritage_description',
    'state_of_land.recreational_trail_use_description',
    'state_of_land.has_shared_info_with_fn',
    'state_of_land.has_acknowledged_undrip',
    'state_of_land.has_archaeology_sites_affected',
    'state_of_land.has_licence_of_occupation',
    'state_of_land.licence_of_occupation',
    'state_of_land.authorization_details',
    'state_of_land.file_number_of_app',
    'state_of_land.applied_for_licence_of_occupation',
    'state_of_land.legal_description_land',
    'first_aid_equipment_on_site',
    'first_aid_cert_level',
    'exploration_access.has_proposed_bridges_or_culverts',
    'exploration_access.bridge_culvert_crossing_description',
    'exploration_access.reclamation_description',
    'exploration_access.reclamation_cost',
    'blasting_operation.has_storage_explosive_on_site',
    'blasting_operation.explosive_permit_issued',
    'blasting_operation.explosive_permit_expiry_date',
    'blasting_operation.explosive_permit_number',
    'blasting_operation.describe_explosives_to_site',
    'blasting_operation.show_access_roads',
    'blasting_operation.show_camps',
    'blasting_operation.show_surface_drilling',
    'blasting_operation.show_mech_trench',
    'blasting_operation.show_seismic',
    'blasting_operation.show_bulk',
    'blasting_operation.show_underground_exploration',
    'blasting_operation.show_sand_gravel_quarry',
    'camp.has_fuel_stored',
    'camp.volume_fuel_stored',
    'camp.has_fuel_stored_in_bulk',
    'camp.has_fuel_stored_in_barrels',
    'camp.reclamation_description',
    'camp.reclamation_cost',
    'camp.health_authority_notified',
    'camp.health_authority_consent',
    'cut_lines_polarization_survey.reclamation_description',
    'cut_lines_polarization_survey.reclamation_cost',
    'mechanical_trenching.reclamation_description',
    'mechanical_trenching.reclamation_cost',
    'placer_operation.is_underground',
    'placer_operation.has_stream_diversion',
    'placer_operation.is_hand_operation',
    'placer_operation.total_disturbed_area',
    'placer_operation.reclamation_description',
    'placer_operation.reclamation_cost',
    'sand_gravel_quarry_operation.average_overburden_depth',
    'sand_gravel_quarry_operation.average_top_soil_depth',
    'sand_gravel_quarry_operation.stability_measures_description',
    'sand_gravel_quarry_operation.is_agricultural_land_reserve',
    'sand_gravel_quarry_operation.land_use_zoning',
    'sand_gravel_quarry_operation.agri_lnd_rsrv_permit_application_number',
    'sand_gravel_quarry_operation.proposed_land_use',
    'sand_gravel_quarry_operation.community_plan',
    'sand_gravel_quarry_operation.has_local_soil_removal_bylaw',
    'sand_gravel_quarry_operation.work_year_info',
    'sand_gravel_quarry_operation.proposed_activity_description',
    'sand_gravel_quarry_operation.total_mineable_reserves',
    'sand_gravel_quarry_operation.total_annual_extraction',
    'sand_gravel_quarry_operation.reclamation_description',
    'sand_gravel_quarry_operation.reclamation_cost',
    'sand_gravel_quarry_operation.reclamation_backfill_detail',
    'sand_gravel_quarry_operation.progressive_reclamation',
    'sand_gravel_quarry_operation.max_unreclaimed',
    'sand_gravel_quarry_operation.average_groundwater_depth',
    'sand_gravel_quarry_operation.has_groundwater_from_test_wells',
    'sand_gravel_quarry_operation.has_groundwater_from_test_pits',
    'sand_gravel_quarry_operation.has_groundwater_from_existing_area',
    'sand_gravel_quarry_operation.groundwater_from_other_description',
    'sand_gravel_quarry_operation.groundwater_protection_plan',
    'sand_gravel_quarry_operation.nearest_residence_distance',
    'sand_gravel_quarry_operation.nearest_water_source_distance',
    'sand_gravel_quarry_operation.secure_access_plan',
    'sand_gravel_quarry_operation.noise_impact_plan',
    'sand_gravel_quarry_operation.dust_impact_plan',
    'sand_gravel_quarry_operation.visual_impact_plan',
    'settling_pond.wastewater_facility_description',
    'settling_pond.is_ponds_recycled',
    'settling_pond.disposal_from_clean_out',
    'settling_pond.is_ponds_exfiltrated',
    'settling_pond.is_ponds_discharged',
    'settling_pond.reclamation_description',
    'settling_pond.reclamation_cost',
    'settling_pond.spillway_design_description',
    'settling_pond.water_discharged_description',
    'settling_pond.decant_structure_description',
    'settling_pond.sediment_control_structure_description',
    'surface_bulk_sample.processing_method_description',
    'surface_bulk_sample.drainage_mitigation_description',
    'surface_bulk_sample.reclamation_description',
    'surface_bulk_sample.reclamation_cost',
    'surface_bulk_sample.handling_instructions',
    'surface_bulk_sample.has_bedrock_excavation',
    'exploration_surface_drilling.reclamation_core_storage',
    'exploration_surface_drilling.reclamation_description',
    'exploration_surface_drilling.reclamation_cost',
    'exploration_surface_drilling.drill_program',
    'underground_exploration.total_ore_amount',
    'underground_exploration.total_waste_amount',
    'underground_exploration.surface_total_ore_amount',
    'underground_exploration.surface_total_waste_amount',
    'underground_exploration.reclamation_description',
    'underground_exploration.reclamation_cost',
    'underground_exploration.proposed_bulk_sample',
    'underground_exploration.proposed_de_watering',
    'underground_exploration.proposed_diamond_drilling',
    'underground_exploration.proposed_mapping_chip_sampling',
    'underground_exploration.proposed_new_development',
    'underground_exploration.proposed_rehab',
    'underground_exploration.proposed_underground_fuel_storage',
]

UNIT_TYPE_CODE_FIELDS = [
    'estimate_rate_unit_type_code',
    'length_unit_type_code',
    'proposed_production_unit_type_code',
    'reclamation_unit_type_code',
    'average_overburden_depth_unit_type_code',
    'average_top_soil_depth_unit_type_code',
    'total_mineable_reserves_unit_type_code',
    'total_annual_extraction_unit_type_code',
    'total_ore_unit_type_code',
    'total_waste_unit_type_code',
    'surface_total_ore_unit_type_code',
    'incline_unit_type_code',
    'surface_total_waste_unit_type_code',
    'max_unreclaimed_unit_type_code',
    'average_groundwater_depth_unit_type_code',
    'nearest_residence_distance_unit_type_code',
    'nearest_water_source_distance_unit_type_code',
]

CHECKBOX_FIELDS = [
    'show_access_roads',
    'show_camps',
    'show_surface_drilling',
    'show_mech_trench',
    'show_seismic',
    'show_bulk',
    'show_underground_exploration',
    'show_sand_gravel_quarry',
    'has_groundwater_from_existing_area',
    'has_groundwater_from_test_pits',
    'has_groundwater_from_test_wells',
    'has_ground_water_from_other',
    'proposed_bulk_sample',
    'proposed_de_watering',
    'proposed_diamond_drilling',
    'proposed_mapping_chip_sampling',
    'proposed_new_development',
    'proposed_rehab',
    'proposed_underground_fuel_storage',
    'has_fuel_stored_in_bulk',
    'has_fuel_stored_in_barrels',
]

UNDERGROUND_EXPLORATION_CODE_FIELDS = [
    'underground_exploration_type_code',
]


class NOWApplicationExportResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('now_application_guid', type=str, location='json', required=True)

    @api.doc(
        description=
        'Generates the specified document for the NoW using the provided template data and issues a one_time token that is used to download the document.',
        params={'document_type_code': 'The code indicating the type of document to generate.'})
    @api.marshal_with(NOW_DOCUMENT_DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_role_edit_permit
    def post(self, document_type_code):
        document_type = NOWApplicationDocumentType.query.get(document_type_code)
        if not document_type:
            raise NotFound('Document type not found')

        if not document_type.document_template:
            raise BadRequest(f'Cannot generate a {document_type.description}')

        if document_type.now_application_document_type_code != 'NTR':
            raise BadRequest(f'This method can only export {document_type.description}')

        data = self.parser.parse_args()
        now_application_guid = data['now_application_guid']
        token = NOWApplicationExportResource.get_now_form_generate_token(now_application_guid)
        return {'token': token}

    @classmethod
    def get_now_form_generate_token(cls, now_application_guid):
        now_application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)

        if not now_application_identity:
            raise NotFound('Notice of Work not found')

        now_application = now_application_identity.now_application
        now_application_json = marshal(now_application, NOW_APPLICATION_MODEL_EXPORT)

        now_application_identity_original = transmogrify_now(now_application_identity)
        original_now_application_json = marshal(now_application_identity_original,
                                                NOW_APPLICATION_MODEL_EXPORT)

        def get_description(type_obj, default):
            return type_obj.description if type_obj else default

        def is_number(s):
            try:
                float(s)
                return True
            except ValueError:
                return False

        def transform_contact(contact):
            def get_address(contact):
                if not contact.get('party', None) or not contact['party'].get(
                        'address', None) or not len(contact['party']['address']) > 0:
                    return ''
                address = contact['party']['address'][0]
                address_string = ''
                if address.get('suite_no', None):
                    address_string += f'{address["suite_no"]} '
                if address.get('address_line_1', None):
                    address_string += f'{address["address_line_1"]} '
                if address.get('address_line_2', None):
                    address_string += address["address_line_2"]
                address_string = address_string.strip()

                if address['city'] or address['sub_division_code'] or address['post_code']:
                    address_string += '\n'
                    if address['city']:
                        address_string += address['city']
                    if address['sub_division_code']:
                        address_string += f' {address["sub_division_code"]}'
                    if address['post_code']:
                        address_string += f' {address["post_code"]}'

                return address_string.strip()

            def get_phone(contact):
                if not contact.get('party', None):
                    return ''
                phone_string = contact['party']['phone_no']
                if contact['party'].get('phone_ext', None):
                    phone_string += f' x{contact["party"]["phone_ext"]}'
                return phone_string

            contact['address'] = get_address(contact)
            contact['phone'] = get_phone(contact)

            return contact

        def format_currency(value):
            return f'${float(value):,.2f}' if value != None and is_number(value) else value

        def format_boolean(value):
            return 'Yes' if value else 'No'

        def format_checkbox(value):
            if value and value is not None:
                return '☑'
            return '☐'

        def get_reclamation_summary(now_application, render):
            summary = []
            activity_types = ActivityType.get_all()
            reclamation_activity_types = (
                activity_type for activity_type in activity_types
                if activity_type.activity_type_code not in ['water_supply', 'blasting_operation'])
            for activity_type in reclamation_activity_types:
                activity_type_code = activity_type.activity_type_code
                if now_application.get(activity_type_code) and render.get(activity_type_code):
                    activity = activity_type.description
                    total = now_application[activity_type_code].get('calculated_total_disturbance')
                    cost = format_currency(
                        now_application[activity_type_code].get('reclamation_cost'))
                    summary.append({'activity': activity, 'total': total, 'cost': cost})
            return summary

        def get_renderable_now_sections(now_application):
            conditional_sections = [
                'sand_gravel_quarry_operation', 'surface_bulk_sample',
                'cut_lines_polarization_survey', 'underground_exploration', 'placer_operation'
            ]

            def get_applicable_now_sections(now_application):
                now_type_conditional_sections = {
                    'QCA': ['sand_gravel_quarry_operation'],
                    'SAG': ['sand_gravel_quarry_operation'],
                    'QIM': ['sand_gravel_quarry_operation'],
                    'COL': [
                        'surface_bulk_sample', 'cut_lines_polarization_survey',
                        'underground_exploration'
                    ],
                    'MIN': [
                        'surface_bulk_sample', 'cut_lines_polarization_survey',
                        'underground_exploration'
                    ],
                    'PLA': [
                        'placer_operation', 'cut_lines_polarization_survey',
                        'underground_exploration'
                    ]
                }
                applicable = {}
                activity_types = ActivityType.get_all()
                notice_of_work_type_code = now_application['notice_of_work_type_code']
                for activity_type in activity_types:
                    activity_type_code = activity_type.activity_type_code
                    if activity_type_code in conditional_sections and activity_type_code in now_type_conditional_sections[
                            notice_of_work_type_code]:
                        applicable[activity_type_code] = True
                return applicable

            def get_populated_hideable_now_sections(now_application):
                hideable_now_sections = [
                    'exploration_access', 'blasting_operation', 'camp',
                    'cut_lines_polarization_survey', 'exploration_surface_drilling',
                    'mechanical_trenching', 'settling_pond', 'surface_bulk_sample',
                    'underground_exploration', 'sand_gravel_quarry_operation', 'placer_operation',
                    'water_supply'
                ]
                populated = {}
                for section in hideable_now_sections:
                    populated[section] = False
                    for key in now_application.get(section, {}):
                        if now_application[section][key] != None:
                            populated[section] = True
                            break
                return populated

            applicable_sections = get_applicable_now_sections(now_application)
            populated_sections = get_populated_hideable_now_sections(now_application)

            render_sections = {}
            for section in populated_sections:
                render_sections[section] = applicable_sections.get(
                    section, False
                    if section in conditional_sections else True) and populated_sections[section]
            return render_sections

        def transform_documents(now_application):
            included_docs = []
            docs = now_application.get('documents', [])
            submission_docs = now_application.get('imported_submission_documents', [])
            for doc in docs:
                if doc['now_application_document_type_code'] in EXCLUDED_APPLICATION_DOCUMENT_TYPES:
                    continue

                document_type = NOWApplicationDocumentType.query.get(
                    doc['now_application_document_type_code'])
                doc['now_application_document_type_description'] = get_description(
                    document_type, doc['now_application_document_type_code'])
                if doc['is_final_package']:
                    included_docs.append(doc)

            for submission_doc in submission_docs:
                if submission_doc['is_final_package']:
                    new_doc = {
                        'now_application_document_type_description': submission_doc['documenttype'],
                        'description': submission_doc['description'],
                        'final_package_order': submission_doc['final_package_order'],
                        'mine_document': {
                            'document_name': submission_doc['filename'],
                            'upload_date': now_application.get('submitted_date', None),
                        }
                    }
                    included_docs.append(new_doc)

            included_docs.sort(
                key=lambda doc: (doc['final_package_order'] is None, doc['final_package_order']))

            return included_docs

        def transform_data(obj):
            ignore_empty_fields = ['details', 'equipment']
            ignore_keys = ['render']
            for key in obj:
                if key in ignore_keys or (not obj[key] and key in ignore_empty_fields):
                    continue
                if obj[key] is None:
                    if key in CHECKBOX_FIELDS:
                        obj[key] = format_checkbox(obj[key])
                    else:
                        obj[key] = EMPTY_FIELD
                elif key in CURRENCY_FIELDS:
                    obj[key] = format_currency(obj[key])
                elif key in UNIT_TYPE_CODE_FIELDS:
                    unit_type_codes = UnitType.get_all()
                    code_object = [
                        code for code in unit_type_codes if code.unit_type_code == obj[key]
                    ]
                    obj[key] = code_object[0].short_description if code_object and len(
                        code_object) > 0 else NOT_APPLICABLE_FIELD
                elif key in UNDERGROUND_EXPLORATION_CODE_FIELDS:
                    type_codes = UndergroundExplorationType.get_all()
                    code_object = [
                        code for code in type_codes
                        if code.underground_exploration_type_code == obj[key]
                    ]
                    obj[key] = code_object[0].description if code_object and len(
                        code_object) > 0 else NOT_APPLICABLE_FIELD
                elif isinstance(obj[key], bool):
                    if key in CHECKBOX_FIELDS:
                        obj[key] = format_checkbox(obj[key])
                    else:
                        obj[key] = format_boolean(obj[key])
                elif isinstance(obj[key], dict):
                    transform_data(obj[key])
                elif isinstance(obj[key], list):
                    for item in obj[key]:
                        transform_data(item)
            return obj

        def remove_signature(party):
            signature = party.get('signature')
            if signature:
                del party['signature']
            return party

        # Transform and format various fields
        for contact in now_application_json.get('contacts', []):
            contact = transform_contact(contact)
        now_application_json['documents'] = transform_documents(now_application_json)
        # now_application_json['filtered_submission_documents'] = transform_documents(now_application_json)

        # Remove signature images from parties
        for contact in now_application_json.get('contacts', []):
            party = contact.get('party')
            if party:
                contact['party'] = remove_signature(party)

        # Remove signature image from the Lead Inspector
        lead_inspector = now_application_json.get('lead_inspector')
        if lead_inspector:
            now_application_json['lead_inspector'] = remove_signature(lead_inspector)

        # Remove signature image from the Issuing Inspector
        issuing_inspector = now_application_json.get('issuing_inspector')
        if issuing_inspector:
            now_application_json['issuing_inspector'] = remove_signature(issuing_inspector)

        now_type = NOWApplicationType.query.filter_by(
            notice_of_work_type_code=now_application_json['notice_of_work_type_code']).first()
        now_application_json['notice_of_work_type_description'] = get_description(
            now_type, now_application_json['notice_of_work_type_code'])
        now_application_json['term_of_application'] = get_duration_text(
            now_application.proposed_start_date, now_application.proposed_end_date)

        permit_type = NOWApplicationPermitType.query.filter_by(
            now_application_permit_type_code=now_application_json['application_permit_type_code']
        ).first()
        now_application_json['application_permit_type_description'] = get_description(
            permit_type, now_application_json['application_permit_type_code'])

        now_application_json['render'] = get_renderable_now_sections(now_application_json)
        now_application_json['summary'] = get_reclamation_summary(now_application_json,
                                                                  now_application_json['render'])
        now_application_json = transform_data(now_application_json)

        # Determine what fields have changed from the original application
        original_now_application_json = transform_data(original_now_application_json)
        edited_fields = {}
        # Commenting out this block for the time being - users do not want to see the edited flags until the data within Core is better.
        # for path in ORIGINAL_NOW_FIELD_PATHS:
        #     if '.' in path:
        #         paths = path.split('.')
        #         if not edited_fields.get(paths[0]):
        #             edited_fields[paths[0]] = {}
        #         current_value = now_application_json[paths[0]][paths[1]]
        #         original_value = original_now_application_json[paths[0]][paths[1]]
        #         if current_value != original_value:
        #             edited_fields[paths[0]][paths[1]] = True
        # else:
        #     current_value = now_application_json[path]
        #     original_value = original_now_application_json[path]
        #     if current_value != original_value:
        #         edited_fields[path] = True
        now_application_json['edited_fields'] = edited_fields

        # Set "export" information
        now_application_json['exported_date_utc'] = datetime.utcnow().strftime('%Y-%m-%d %H:%M')

        # For now, we don't have a "proper" means of authorizing communication between our microservices, so this temporary solution
        # has been put in place to authorize with the document manager (pass the authorization headers into the token and re-use them
        # later). A ticket (MDS-2744) to set something else up as been created.
        token = uuid.uuid4()
        cache.set(
            NOW_DOCUMENT_DOWNLOAD_TOKEN(token), {
                'document_type_code': 'NTR',
                'now_application_guid': now_application_guid,
                'template_data': now_application_json,
                'username': User().get_user_username(),
                'authorization_header': request.headers['Authorization']
            }, TIMEOUT_5_MINUTES)

        return token
