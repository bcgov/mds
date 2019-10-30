from app.extensions import api
from flask_restplus import fields

MINE_DOCUMENT = api.model(
    'MineDocument', {
        'mine_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'upload_date': fields.DateTime,
    })

MINE_PARTY_APPT_TYPE_MODEL = api.model(
    'MinePartyApptType', {
        'mine_party_appt_type_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'person': fields.Boolean,
        'organization': fields.Boolean,
        'grouping_level': fields.Integer,
        'active_ind': fields.Boolean
    })

MINE_PARTY_APPT = api.model(
    'MinePartyAppointment', {
        'mine_party_appt_guid': fields.String,
        'mine_guid': fields.String,
        'party_guid': fields.String,
        'mine_party_appt_type_code': fields.String,
        'start_date': fields.Date,
        'end_date': fields.Date,
        'documents': fields.Nested(MINE_DOCUMENT)
    })

ADDRESS = api.model(
    'Address', {
        'suite_no': fields.String,
        'address_line_1': fields.String,
        'address_line_2': fields.String,
        'city': fields.String,
        'sub_division_code': fields.String,
        'post_code': fields.String,
        'address_type_code': fields.String,
    })

PARTY = api.model(
    'Party', {
        'party_guid': fields.String,
        'party_type_code': fields.String,
        'phone_no': fields.String,
        'phone_ext': fields.String,
        'email': fields.String,
        'effective_date': fields.Date,
        'expiry_date': fields.Date,
        'party_name': fields.String,
        'name': fields.String,
        'first_name': fields.String,
        'address': fields.List(fields.Nested(ADDRESS)),
        'mine_party_appt': fields.Nested(MINE_PARTY_APPT),
        'job_title': fields.String,
        'postnominal_letters': fields.String,
        'idir_username': fields.String,
    })

PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

NOW_APPLICATION_CUT_LINES = api.inherit(
    'NOWApplicationCutLines',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
                                                 #No columns
    })

NOW_APPLICATION_EXP_SURFACE_DRILL = api.inherit('NOWApplicationExpSurfaceDrill',
                                                NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
                                                {'reclamation_core_storage': fields.String})

NOW_APPLICATION_MECH_TRENCHING = api.inherit(
    'NOWApplicationMechTrenching',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
                                                 #No columns
    })

NOW_APPLICATION_PLACER_OPS = api.inherit(
    'NOWApplicationPlacerOperations', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'is_underground': fields.Boolean,
        'is_hand_operation': fields.Boolean,
        'reclamation_area': fields.Fixed,
        'reclamation_unit_type_code': fields.String
    })

NOW_APPLICATION_SAND_AND_GRAVEL = api.inherit(
    'NOWApplicationSandAndGravel',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
        'average_overburden_depth': fields.Fixed,
        'average_top_soil_depth': fields.Fixed,
        'stability_measures_description': fields.String,
        'is_agricultural_land_reserve': fields.String,
        'agri_lnd_rsrv_permit_application_number': fields.String,
        'has_local_soil_removal_bylaw': fields.Boolean,
        'community_plan': fields.String,
        'land_use_zoning': fields.String,
        'proposed_land_use': fields.String,
        'total_mineable_reserves': fields.Integer,
        'total_mineable_reserves_unit_type_code': fields.String,
        'total_annual_extraction': fields.Integer,
        'total_annual_extraction_unit_type_code': fields.String,
        'average_groundwater_depth': fields.Fixed,
        'has_groundwater_from_existing_area': fields.Boolean,
        'has_groundwater_from_test_pits': fields.Boolean,
        'has_groundwater_from_test_wells': fields.Boolean,
        'groundwater_from_other_description': fields.String,
        'groundwater_protection_plan': fields.String,
        'nearest_residence_distance': fields.Integer,
        'nearest_residence_distance_unit_type_code': fields.String,
        'nearest_water_source_distance': fields.Integer,
        'nearest_water_source_distance_unit_type_code': fields.String,
        'noise_impact_plan': fields.String,
        'secure_access_plan': fields.String,
        'dust_impact_plan': fields.String,
        'visual_impact_plan': fields.String,
        'reclamation_backfill_detail': fields.String,
    })

NOW_APPLICATION_CUT_LINES = api.inherit(
    'NOWApplicationCamp',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
                                                 #No columns
    })

NOW_APPLICATION_CUT_LINES = api.inherit(
    'NOWApplicationCamp',
    NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
    {
                                                 #No columns
    })

NOW_APPLICATION_MODEL = api.model(
    'NOWApplication',
    {
        'now_application_guid': fields.String,
        'mine_guid': fields.String,
        'now_message_id': fields.String,
        'notice_of_work_type_code': fields.String,                   ## code
        'now_application_status_code': fields.String,                ##code
        'submitted_date': Date,
        'received_date': Date,
        'now_application_guid': fields.String,
        'latitude': fields.Fixed,
        'longitude': fields.Fixed,
        'property_name': fields.String,
        'tenure_number': fields.String,
        'latitude': fields.String,
        'description_of_land': fields.String,
        'proposed_start_date': Date,
        'proposed_end_date': Date,
        'camps': fields.Nested(NOW_APPLICATION_CAMP, skip_none=True),
        'cut_lines_polarization_survey': fields.Nested(NOW_APPLICATION_CUT_LINES, skip_none=True),
        'exploration_surface_drilling': fields.Nested(NOW_APPLICATION_EXP_SURFACE_DRILL, skip_none=True),
        'mechanical_trenching': fields.Nested(NOW_APPLICATION_MECH_TRENCHING, skip_none=True),
        'placer_operation': fields.Nested(NOW_APPLICATION_PLACER_OPS, skip_none=True),
        'sand_and_gravel': fields.Nested(NOW_APPLICATION_SAND_AND_GRAVEL, skip_none=True)
    })