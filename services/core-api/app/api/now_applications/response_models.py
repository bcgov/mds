from app.extensions import api
from flask_restplus import fields

from app.api.parties.response_models import PARTY
from app.api.mines.response_models import MINE_DOCUMENT_MODEL, PERMIT_AMENDMENT_SHORT_MODEL, MINE_TYPE_MODEL
from app.api.document_generation.response_models import DOCUMENT_TEMPLATE_MODEL


class DateTime(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d %H:%M") if value else None


class Date(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d") if value else None


NOW_APPLICATION_EQUIPMENT = api.model(
    'NOWEquipment', {
        'equipment_id': fields.Integer,
        'description': fields.String,
        'quantity': fields.Integer,
        'capacity': fields.String,
    })

NOW_APPLICATION_ACTIVITY_DETAIL_BASE = api.model(
    'NOWApplicationActivityDetailBase', {
        'activity_detail_id': fields.Integer,
        'activity_type_description': fields.String,
        'disturbed_area': fields.Fixed,
        'timber_volume': fields.Fixed(decimals=2),
        'number_of_sites': fields.Integer,
        'length': fields.Fixed(decimals=2),
        'width': fields.Fixed(decimals=2),
        'depth': fields.Fixed(decimals=2),
        'height': fields.Fixed(decimals=2),
        'quantity': fields.Fixed(decimals=2),
        'incline': fields.Fixed(decimals=2),
        'incline_unit_type_code': fields.String,
        'cut_line_length': fields.Fixed(decimals=2),
        'water_quantity': fields.Fixed(decimals=2),
        'water_quantity_unit_type_code': fields.String,
        'cut_line_length_unit_type_code': fields.String,
        'length_unit_type_code': fields.String,
        'width_unit_type_code': fields.String,
        'height_unit_type_code': fields.String,
        'depth_unit_type_code': fields.String,
        'timber_volume_unit_type_code': fields.String,
        'disturbed_area_unit_type_code': fields.String,
    })

NOW_APPLICATION_ACTIVITY_SUMMARY_BASE = api.model(
    'NOWApplicationActivitySummaryBase', {
        'reclamation_description': fields.String,
        'reclamation_cost': fields.Fixed(decimals=2),
        'total_disturbed_area': fields.Fixed,
        'total_disturbed_area_unit_type_code': fields.String,
        'equipment': fields.List(fields.Nested(NOW_APPLICATION_EQUIPMENT))
    })

NOW_APPLICATION_CAMP_DETAIL = api.inherit(
    'NOWApplicationCampDetail', NOW_APPLICATION_ACTIVITY_DETAIL_BASE, {
        'number_people': fields.Fixed,
        'number_structures': fields.Fixed,
        'description_of_structures': fields.String,
        'waste_disposal': fields.String,
        'sanitary_facilities': fields.String,
        'water_supply': fields.String,
    })

NOW_APPLICATION_STAGING_AREA_DETAIL = api.inherit('NOWApplicationBuildingDetail',
                                                  NOW_APPLICATION_ACTIVITY_DETAIL_BASE, {
                                                      'name': fields.String,
                                                  })

NOW_APPLICATION_BUILDING_DETAIL = api.inherit('NOWApplicationBuildingDetail',
                                              NOW_APPLICATION_ACTIVITY_DETAIL_BASE, {
                                                  'purpose': fields.String,
                                                  'structure': fields.String,
                                              })
NOW_APPLICATION_CAMP = api.inherit(
    'NOWApplicationCamp', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'health_authority_consent':
        fields.Boolean,
        'health_authority_notified':
        fields.Boolean,
        'has_fuel_stored':
        fields.Boolean,
        'has_fuel_stored_in_bulk':
        fields.Boolean,
        'has_fuel_stored_in_barrels':
        fields.Boolean,
        'volume_fuel_stored':
        fields.Fixed(decimals=2),
        'calculated_total_disturbance':
        fields.Fixed(decimals=5),
        'details':
        fields.List(fields.Nested(NOW_APPLICATION_CAMP_DETAIL, skip_none=True)),
        'building_details':
        fields.List(fields.Nested(NOW_APPLICATION_BUILDING_DETAIL, skip_none=True)),
        'staging_area_details':
        fields.List(fields.Nested(NOW_APPLICATION_STAGING_AREA_DETAIL, skip_none=True)),
    })

NOW_APPLICATION_BLASTING_OPERATION = api.inherit(
    'NOWApplicationBlasting', {
        'has_storage_explosive_on_site': fields.Boolean,
        'explosive_permit_issued': fields.Boolean,
        'explosive_permit_number': fields.String,
        'explosive_permit_expiry_date': Date,
        'describe_explosives_to_site': fields.String,
        'show_access_roads': fields.Boolean,
        'show_camps': fields.Boolean,
        'show_surface_drilling': fields.Boolean,
        'show_mech_trench': fields.Boolean,
        'show_seismic': fields.Boolean,
        'show_bulk': fields.Boolean,
        'show_underground_exploration': fields.Boolean,
        'show_sand_gravel_quarry': fields.Boolean,
    })

NOW_APPLICATION_CUT_LINES = api.inherit(
    'NOWApplicationCutLines', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'calculated_total_disturbance': fields.Fixed(decimals=5),
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE, skip_none=True))
    })

NOW_APPLICATION_EXP_ACCESS = api.inherit(
    'NOWApplicationExplorationAccess', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'has_proposed_bridges_or_culverts': fields.Boolean,
        'bridge_culvert_crossing_description': fields.String,
        'calculated_total_disturbance': fields.Fixed(decimals=5),
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE, skip_none=True))
    })

NOW_APPLICATION_EXP_SURFACE_DRILL = api.inherit(
    'NOWApplicationExpSurfaceDrill', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'reclamation_core_storage': fields.String,
        'calculated_total_disturbance': fields.Fixed(decimals=5),
        'drill_program': fields.String,
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE, skip_none=True))
    })

NOW_APPLICATION_MECH_TRENCHING = api.inherit(
    'NOWApplicationMechTrenching', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'calculated_total_disturbance': fields.Fixed(decimals=5),
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE, skip_none=True))
    })

NOW_APPLICATION_PLACER_OPS = api.inherit(
    'NOWApplicationPlacerOperations', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'is_underground': fields.Boolean,
        'is_hand_operation': fields.Boolean,
        'has_stream_diversion': fields.Boolean,
        'reclamation_area': fields.Fixed(decimals=2),
        'reclamation_unit_type_code': fields.String,
        'proposed_production': fields.String,
        'proposed_production_unit_type_code': fields.String,
        'calculated_total_disturbance': fields.Fixed(decimals=5),
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE, skip_none=True)),
    })

NOW_APPLICATION_SAND_GRAVEL_QUARRY_OPERATION = api.inherit(
    'NOWApplicationSandAndGravel', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'average_overburden_depth': fields.Fixed(decimals=2),
        'average_overburden_depth_unit_type_code': fields.String,
        'average_top_soil_depth_unit_type_code': fields.String,
        'average_top_soil_depth': fields.Fixed(decimals=2),
        'stability_measures_description': fields.String,
        'is_agricultural_land_reserve': fields.Boolean,
        'agri_lnd_rsrv_permit_application_number': fields.String,
        'has_local_soil_removal_bylaw': fields.Boolean,
        'community_plan': fields.String,
        'land_use_zoning': fields.String,
        'proposed_land_use': fields.String,
        'total_mineable_reserves': fields.Fixed(decimals=2),
        'total_mineable_reserves_unit_type_code': fields.String,
        'total_annual_extraction': fields.Fixed(decimals=2),
        'total_annual_extraction_unit_type_code': fields.String,
        'average_groundwater_depth': fields.Fixed(decimals=2),
        'average_groundwater_depth_unit_type_code': fields.String,
        'has_groundwater_from_existing_area': fields.Boolean,
        'has_groundwater_from_test_pits': fields.Boolean,
        'has_groundwater_from_test_wells': fields.Boolean,
        'has_ground_water_from_other': fields.Boolean,
        'groundwater_from_other_description': fields.String,
        'groundwater_protection_plan': fields.String,
        'nearest_residence_distance': fields.Fixed(decimals=2),
        'nearest_residence_distance_unit_type_code': fields.String,
        'nearest_water_source_distance': fields.Fixed(decimals=2),
        'nearest_water_source_distance_unit_type_code': fields.String,
        'noise_impact_plan': fields.String,
        'secure_access_plan': fields.String,
        'dust_impact_plan': fields.String,
        'visual_impact_plan': fields.String,
        'reclamation_backfill_detail': fields.String,
        'calculated_total_disturbance': fields.Fixed(decimals=5),
        'progressive_reclamation': fields.Boolean,
        'max_unreclaimed': fields.Fixed(decimals=2),
        'max_unreclaimed_unit_type_code': fields.String,
        'proposed_activity_description': fields.String,
        'work_year_info': fields.String,
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE, skip_none=True))
    })
NOW_APPLICATION_SETTLING_POND_DETAIL = api.inherit('NOWApplicationCampDetail',
                                                   NOW_APPLICATION_ACTIVITY_DETAIL_BASE, {
                                                       'water_source_description': fields.String,
                                                       'construction_plan': fields.String
                                                   })

NOW_APPLICATION_SETTLING_POND = api.inherit(
    'NOWApplicationSettlingPond', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'proponent_pond_name': fields.String,
        'is_ponds_exfiltrated': fields.Boolean,
        'is_ponds_recycled': fields.Boolean,
        'is_ponds_discharged': fields.Boolean,
        'wastewater_facility_description': fields.String,
        'sediment_control_structure_description': fields.String,
        'decant_structure_description': fields.String,
        'water_discharged_description': fields.String,
        'spillway_design_description': fields.String,
        'disposal_from_clean_out': fields.String,
        'calculated_total_disturbance': fields.Fixed(decimals=5),
        'details': fields.List(fields.Nested(NOW_APPLICATION_SETTLING_POND_DETAIL, skip_none=True)),
    })

NOW_APPLICATION_SURFACE_BULK = api.inherit(
    'NOWApplicationSurfaceBulkSample', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'processing_method_description': fields.String,
        'has_bedrock_excavation': fields.Boolean,
        'handling_instructions': fields.String,
        'drainage_mitigation_description': fields.String,
        'calculated_total_disturbance': fields.Fixed(decimals=5),
        'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE, skip_none=True)),
    })

NOW_APPLICATION_UNDERGROUND_EXPLORATION_DETAIL = api.inherit(
    'NOWApplicationCampDetail', NOW_APPLICATION_ACTIVITY_DETAIL_BASE, {
        'underground_exploration_type_code': fields.String,
    })

NOW_APPLICATION_UNDERGROUND_EXPLORATION = api.inherit(
    'NOWApplicationUndergroundExploration', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'total_ore_amount':
        fields.Fixed(decimals=2),
        'total_ore_unit_type_code':
        fields.String,
        'total_waste_amount':
        fields.Fixed(decimals=2),
        'total_waste_unit_type_code':
        fields.String,
        'proposed_bulk_sample':
        fields.Boolean,
        'proposed_de_watering':
        fields.Boolean,
        'proposed_diamond_drilling':
        fields.Boolean,
        'proposed_mapping_chip_sampling':
        fields.Boolean,
        'proposed_new_development':
        fields.Boolean,
        'proposed_rehab':
        fields.Boolean,
        'proposed_underground_fuel_storage':
        fields.Boolean,
        'surface_total_ore_amount':
        fields.Fixed(decimals=2),
        'surface_total_ore_unit_type_code':
        fields.String,
        'surface_total_waste_amount':
        fields.Fixed(decimals=2),
        'surface_total_waste_unit_type_code':
        fields.String,
        'proposed_activity':
        fields.String,
        'calculated_total_disturbance':
        fields.Fixed(decimals=5),
        'details':
        fields.List(fields.Nested(NOW_APPLICATION_UNDERGROUND_EXPLORATION_DETAIL, skip_none=True)),
    })

NOW_APPLICATION_WATER_SUPPLY_DETAIL = api.inherit(
    'NOWApplicationWaterSupplyDetail', NOW_APPLICATION_ACTIVITY_DETAIL_BASE, {
        'supply_source_description': fields.String,
        'supply_source_type': fields.String,
        'water_use_description': fields.String,
        'estimate_rate': fields.Fixed(decimals=7),
        'estimate_rate_unit_type_code': fields.String,
        'pump_size': fields.Fixed(decimals=2),
        'intake_location': fields.String
    })

NOW_APPLICATION_WATER_SUPPLY = api.inherit(
    'NOWApplicationWaterSupply',
    {'details': fields.List(fields.Nested(NOW_APPLICATION_WATER_SUPPLY_DETAIL, skip_none=True))})

NOW_APPLICATION_STATE_OF_LAND = api.model(
    'NOWStateOfLand', {
        'has_community_water_shed': fields.Boolean,
        'has_archaeology_sites_affected': fields.Boolean,
        'present_land_condition_description': fields.String,
        'means_of_access_description': fields.String,
        'physiography_description': fields.String,
        'old_equipment_description': fields.String,
        'type_of_vegetation_description': fields.String,
        'recreational_trail_use_description': fields.String,
        'arch_site_protection_plan': fields.String,
        'fn_engagement_activities': fields.String,
        'cultural_heritage_description': fields.String,
        'has_shared_info_with_fn': fields.Boolean,
        'has_fn_cultural_heritage_sites_in_area': fields.Boolean,
        'has_activity_in_park': fields.Boolean,
        'is_on_private_land': fields.Boolean,
        'is_on_crown_land': fields.Boolean,
        'has_auth_lieutenant_gov_council': fields.Boolean,
        'authorization_details': fields.String,
        'has_licence_of_occupation': fields.Boolean,
        'licence_of_occupation': fields.String,
        'file_number_of_app': fields.String,
        'applied_for_licence_of_occupation': fields.Boolean,
        'notice_served_to_private': fields.Boolean,
        'legal_description_land': fields.String,
    })

NOW_APPLICATION_DOCUMENT = api.model(
    'NOW_DOCUMENT', {
        'now_application_document_xref_guid': fields.String,
        'now_application_document_type_code': fields.String,
        'now_application_document_sub_type_code': fields.String,
        'description': fields.String,
        'is_final_package': fields.Boolean,
        'final_package_order': fields.Integer,
        'is_referral_package': fields.Boolean,
        'is_consultation_package': fields.Boolean,
        'preamble_title': fields.String,
        'preamble_author': fields.String,
        'preamble_date': fields.DateTime,
        'mine_document': fields.Nested(MINE_DOCUMENT_MODEL),
    })

NOW_APPLICATION_PROGRESS = api.model(
    'NOWApplicationProgress', {
        'start_date': fields.DateTime,
        'end_date': fields.DateTime,
        'created_by': fields.String,
        'application_progress_status_code': fields.String,
        'last_updated_by': fields.String
    })

NOW_APPLICATION_DELAY = api.model(
    'NOWApplicationDelay', {
        'now_application_delay_guid': fields.String,
        'delay_type_code': fields.String,
        'start_comment': fields.String,
        'start_date': fields.DateTime,
        'end_comment': fields.String,
        'end_date': fields.DateTime
    })

NOW_APPLICATION_REVIEW_MODEL = api.model(
    'NOWApplicationReview', {
        'now_application_review_id': fields.Integer,
        'now_application_guid': fields.String(attribute='now_application.now_application_guid'),
        'now_application_review_type_code': fields.String,
        'response_date': fields.Date,
        'referee_name': fields.String,
        'referral_number': fields.String,
        'response_url': fields.String,
        'documents': fields.List(fields.Nested(NOW_APPLICATION_DOCUMENT))
    })

NOW_SUBMISSION_DOCUMENT = api.model(
    'SUBMISSION_DOCUMENT', {
        'id': fields.Integer,
        'messageid': fields.Integer,
        'documenturl': fields.String,
        'filename': fields.String,
        'documenttype': fields.String,
        'description': fields.String,
    })

NOW_PARTY_APPOINTMENT = api.model(
    'NOW_PARTY_APPOINTMENT', {
        'now_party_appointment_id': fields.Integer,
        'mine_party_appt_type_code': fields.String,
        'mine_party_appt_type_code_description': fields.String,
        'party_guid': fields.String,
        'party': fields.Nested(PARTY),
        'state_modified': fields.String,
    })

IMPORTED_NOW_SUBMISSION_DOCUMENT = api.model(
    'IMPORTED_NOW_SUBMISSION_DOCUMENT', {
        'id': fields.Integer,
        'messageid': fields.Integer,
        'documenturl': fields.String,
        'filename': fields.String,
        'documenttype': fields.String,
        'description': fields.String,
        'mine_document_guid': fields.String,
        'document_manager_guid': fields.String,
        'is_final_package': fields.Boolean,
        'final_package_order': fields.Integer,
        'is_referral_package': fields.Boolean,
        'is_consultation_package': fields.Boolean,
        'preamble_title': fields.String,
        'preamble_author': fields.String,
        'preamble_date': fields.DateTime,
        'now_application_document_xref_guid': fields.String,
        'now_application_id': fields.Integer,
        'update_timestamp': fields.DateTime
    })

APPLICATION_SOURCE_TYPE_CODE = api.model(
    'application_source_type_code', {
        'application_source_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
    })

APPLICATION_REASON_CODE = api.model(
    'APPLICATION_REASON_CODE', {
        'application_reason_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
    })

APPLICATION_REASON_CODE_XREF = api.model(
    'APPLICATION_REASON_CODE', {
        'application_reason_code': fields.String,
        'now_application_id': fields.Integer,
        'state_modified': fields.String
    })

NOW_APPLICATION_MODEL = api.model(
    'NOW_APPLICATION_MODEL', {
        'now_application_guid':
        fields.String,
        'now_number':
        fields.String,
        'now_tracking_number':
        fields.Integer,
        'mine_guid':
        fields.String,
        'mine_name':
        fields.String,
        'mine_no':
        fields.String,
        'mine_region':
        fields.String,
        'lead_inspector_party_guid':
        fields.String,
        'lead_inspector':
        fields.Nested(PARTY),
        'issuing_inspector_party_guid':
        fields.String,
        'issuing_inspector':
        fields.Nested(PARTY),
        'imported_to_core':
        fields.Boolean,
        'is_historic':
        fields.Boolean,
        'imported_date':
        Date,
        'imported_by':
        fields.String,
        'notice_of_work_type_code':
        fields.String,
        'now_application_status_code':
        fields.String,
        'previous_application_status_code':
        fields.String,
        'status_updated_date':
        Date,
        'status_reason':
        fields.String,
        'submitted_date':
        Date,
        'received_date':
        Date,
        'verified_by_user_date':
        Date,
        'decision_by_user_date':
        Date,
        'latitude':
        fields.Fixed(decimals=7),
        'longitude':
        fields.Fixed(decimals=7),
        'gate_latitude':
        fields.Fixed(decimals=7),
        'gate_longitude':
        fields.Fixed(decimals=7),
        'property_name':
        fields.String,
        'tenure_number':
        fields.String,
        'description_of_land':
        fields.String,
        'application_permit_type_code':
        fields.String,
        'proposed_start_date':
        Date,
        'proposed_end_date':
        Date,
        'directions_to_site':
        fields.String,
        'work_plan':
        fields.String,
        'type_of_application':
        fields.String,
        'proposed_annual_maximum_tonnage':
        fields.Fixed(decimals=2),
        'adjusted_annual_maximum_tonnage':
        fields.Fixed(decimals=2),
        'crown_grant_or_district_lot_numbers':
        fields.String,
        'req_access_authorization_numbers':
        fields.String,
        'has_surface_disturbance_outside_tenure':
        fields.Boolean,
        'is_access_gated':
        fields.Boolean,
        'has_key_for_inspector':
        fields.Boolean,
        'has_req_access_authorizations':
        fields.Boolean,
        'application_progress':
        fields.Nested(NOW_APPLICATION_PROGRESS, skip_none=True),
        'state_of_land':
        fields.Nested(NOW_APPLICATION_STATE_OF_LAND, skip_none=True),
        'first_aid_equipment_on_site':
        fields.String,
        'first_aid_cert_level':
        fields.String,
        'blasting_operation':
        fields.Nested(NOW_APPLICATION_BLASTING_OPERATION, skip_none=True),
        'camp':
        fields.Nested(NOW_APPLICATION_CAMP, skip_none=True),
        'cut_lines_polarization_survey':
        fields.Nested(NOW_APPLICATION_CUT_LINES, skip_none=True),
        'exploration_access':
        fields.Nested(NOW_APPLICATION_EXP_ACCESS, skip_none=True),
        'exploration_surface_drilling':
        fields.Nested(NOW_APPLICATION_EXP_SURFACE_DRILL, skip_none=True),
        'mechanical_trenching':
        fields.Nested(NOW_APPLICATION_MECH_TRENCHING, skip_none=True),
        'placer_operation':
        fields.Nested(NOW_APPLICATION_PLACER_OPS, skip_none=True),
        'sand_gravel_quarry_operation':
        fields.Nested(NOW_APPLICATION_SAND_GRAVEL_QUARRY_OPERATION, skip_none=True),
        'settling_pond':
        fields.Nested(NOW_APPLICATION_SETTLING_POND, skip_none=True),
        'surface_bulk_sample':
        fields.Nested(NOW_APPLICATION_SURFACE_BULK, skip_none=True),
        'underground_exploration':
        fields.Nested(NOW_APPLICATION_UNDERGROUND_EXPLORATION, skip_none=True),
        'water_supply':
        fields.Nested(NOW_APPLICATION_WATER_SUPPLY, skip_none=True),
        'documents':
        fields.List(fields.Nested(NOW_APPLICATION_DOCUMENT), skip_none=True),
        'submission_documents':
        fields.List(fields.Nested(NOW_SUBMISSION_DOCUMENT), skip_none=True),
        'contacts':
        fields.List(fields.Nested(NOW_PARTY_APPOINTMENT), skip_none=True),
        'liability_adjustment':
        fields.Fixed(decimals=2),
        'security_received_date':
        Date,
        'security_not_required':
        fields.Boolean,
        'security_not_required_reason':
        fields.String,
        'last_updated_date':
        DateTime,
        'last_updated_by':
        fields.String,
        'permit_status':
        fields.String,
        'term_of_application':
        fields.Integer,
        'is_applicant_individual_or_company':
        fields.String,
        'relationship_to_applicant':
        fields.String,
        'merchantable_timber_volume':
        fields.Fixed(decimals=2),
        'total_merchantable_timber_volume':
        fields.Fixed(decimals=2),
        'imported_submission_documents':
        fields.List(fields.Nested(NOW_SUBMISSION_DOCUMENT)),
        'filtered_submission_documents':
        fields.List(fields.Nested(IMPORTED_NOW_SUBMISSION_DOCUMENT)),
        'is_pre_launch':
        fields.Boolean,
        'application_type_code':
        fields.String,
        'application_source_type_code':
        fields.String,
        'application_reason_codes':
        fields.List(fields.Nested(APPLICATION_REASON_CODE)),
        'source_permit_guid':
        fields.String,
        'source_permit_amendment_guid':
        fields.String,
        'is_source_permit_generated_in_core':
        fields.Boolean,
        'proponent_submitted_permit_number':
        fields.String,
        'annual_summary_submitted':
        fields.Boolean,
        'is_first_year_of_multi':
        fields.Boolean,
        'ats_authorization_number':
        fields.Integer,
        'ats_project_number':
        fields.Integer,
        'other_information':
        fields.String,
        'unreclaimed_disturbance_previous_year':
        fields.Fixed(decimals=2),
        'disturbance_planned_reclamation':
        fields.Fixed(decimals=2),
        'original_start_date':
        Date,
        'site_property':
        fields.Nested(MINE_TYPE_MODEL),
        'equipment':
        fields.List(fields.Nested(NOW_APPLICATION_EQUIPMENT)),
        'mine_latitude':
        fields.Fixed(decimals=7),
        'mine_longitude':
        fields.Fixed(decimals=7),
        'permittee':
        fields.Nested(PARTY, skip_none=True)
    })

NOW_APPLICATION_MODEL_EXPORT = api.model(
    'NOW_APPLICATION_MODEL_EXPORT', {
        'now_application_guid': fields.String,
        'now_number': fields.String,
        'now_tracking_number': fields.Integer,
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'mine_region': fields.String,
        'proponent_submitted_permit_number': fields.String,
        'lead_inspector_party_guid': fields.String,
        'lead_inspector': fields.Nested(PARTY),
        'issuing_inspector_party_guid': fields.String,
        'issuing_inspector': fields.Nested(PARTY),
        'imported_to_core': fields.Boolean,
        'notice_of_work_type_code': fields.String,
        'now_application_status_code': fields.String,
        'status_updated_date': Date,
        'status_reason': fields.String,
        'submitted_date': Date,
        'received_date': Date,
        'is_first_year_of_multi': fields.Boolean,
        'latitude': fields.Fixed(decimals=7),
        'longitude': fields.Fixed(decimals=7),
        'gate_latitude': fields.Fixed(decimals=7),
        'gate_longitude': fields.Fixed(decimals=7),
        'property_name': fields.String,
        'tenure_number': fields.String,
        'unreclaimed_disturbance_previous_year': fields.Integer,
        'disturbance_planned_reclamation': fields.Integer,
        'description_of_land': fields.String,
        'application_permit_type_code': fields.String,
        'proposed_start_date': Date,
        'proposed_end_date': Date,
        'directions_to_site': fields.String,
        'work_plan': fields.String,
        'type_of_application': fields.String,
        'is_applicant_individual_or_company': fields.String,
        'relationship_to_applicant': fields.String,
        'merchantable_timber_volume': fields.Fixed(decimals=2),
        'total_merchantable_timber_volume': fields.Fixed(decimals=2),
        'proposed_annual_maximum_tonnage': fields.Fixed(decimals=2),
        'adjusted_annual_maximum_tonnage': fields.Fixed(decimals=2),
        'crown_grant_or_district_lot_numbers': fields.String,
        'req_access_authorization_numbers': fields.String,
        'has_surface_disturbance_outside_tenure': fields.Boolean,
        'is_access_gated': fields.Boolean,
        'has_key_for_inspector': fields.Boolean,
        'has_req_access_authorizations': fields.Boolean,
        'application_progress': fields.Nested(NOW_APPLICATION_PROGRESS),
        'state_of_land': fields.Nested(NOW_APPLICATION_STATE_OF_LAND),
        'first_aid_equipment_on_site': fields.String,
        'first_aid_cert_level': fields.String,
        'other_information': fields.String,
        'blasting_operation': fields.Nested(NOW_APPLICATION_BLASTING_OPERATION),
        'camp': fields.Nested(NOW_APPLICATION_CAMP),
        'cut_lines_polarization_survey': fields.Nested(NOW_APPLICATION_CUT_LINES),
        'exploration_access': fields.Nested(NOW_APPLICATION_EXP_ACCESS),
        'exploration_surface_drilling': fields.Nested(NOW_APPLICATION_EXP_SURFACE_DRILL),
        'mechanical_trenching': fields.Nested(NOW_APPLICATION_MECH_TRENCHING),
        'placer_operation': fields.Nested(NOW_APPLICATION_PLACER_OPS),
        'sand_gravel_quarry_operation': fields.Nested(NOW_APPLICATION_SAND_GRAVEL_QUARRY_OPERATION),
        'settling_pond': fields.Nested(NOW_APPLICATION_SETTLING_POND),
        'surface_bulk_sample': fields.Nested(NOW_APPLICATION_SURFACE_BULK),
        'underground_exploration': fields.Nested(NOW_APPLICATION_UNDERGROUND_EXPLORATION),
        'water_supply': fields.Nested(NOW_APPLICATION_WATER_SUPPLY),
        'documents': fields.List(fields.Nested(NOW_APPLICATION_DOCUMENT)),
        'submission_documents': fields.List(fields.Nested(IMPORTED_NOW_SUBMISSION_DOCUMENT)),
        'imported_submission_documents': fields.List(
            fields.Nested(IMPORTED_NOW_SUBMISSION_DOCUMENT)),
        'contacts': fields.List(fields.Nested(NOW_PARTY_APPOINTMENT)),
        'liability_adjustment': fields.Fixed(decimals=2),
        'security_received_date': Date,
        'security_not_required': fields.Boolean,
        'security_not_required_reason': fields.String,
        'last_updated_date': Date,
        'equipment': fields.List(fields.Nested(NOW_APPLICATION_EQUIPMENT)),
    })

NOW_VIEW_MODEL = api.model(
    'NOW_VIEW_MODEL', {
        'now_application_guid':
        fields.String,
        'mine_guid':
        fields.String,
        'mine_no':
        fields.String,
        'mine_name':
        fields.String,
        'mine_region':
        fields.String,
        'mine_latitude':
        fields.Fixed(decimals=7),
        'mine_longitude':
        fields.Fixed(decimals=7),
        'contacts':
        fields.List(fields.Nested(NOW_PARTY_APPOINTMENT), skip_none=True),
        'now_number':
        fields.String,
        'permit_no':
        fields.String,
        'party':
        fields.String,
        'lead_inspector_party_guid':
        fields.String,
        'lead_inspector_name':
        fields.String,
        'notice_of_work_type_description':
        fields.String,
        'now_application_status_description':
        fields.String,
        'received_date':
        Date,
        'is_historic':
        fields.Boolean,
        'originating_system':
        fields.String,
        'application_documents':
        fields.List(fields.Nested(IMPORTED_NOW_SUBMISSION_DOCUMENT), skip_none=True),
        'import_timestamp':
        DateTime,
        'update_timestamp':
        DateTime,
        'application_type_code':
        fields.String,
        'application_type_description':
        fields.String,
        'permit_amendment':
        fields.Nested(PERMIT_AMENDMENT_SHORT_MODEL),
        'application_reason_codes':
        fields.List(fields.Nested(APPLICATION_REASON_CODE)),
        'permittee':
        fields.Nested(PARTY, skip_none=True),
        'status_reason':
        fields.String,
        'documents':
        fields.List(fields.Nested(NOW_APPLICATION_DOCUMENT)),
        'issuing_inspector_party_guid':
        fields.String,
        'issuing_inspector_name':
        fields.String,
        'now_application_status_code':
        fields.String,
        'decision_date':
        Date,
        'source_permit_no':
        fields.String,
        'source_permit_amendment_issue_date':
        fields.Date,
    })

PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

NOW_VIEW_LIST = api.inherit('NOWApplicationList', PAGINATED_LIST, {
    'records': fields.List(fields.Nested(NOW_VIEW_MODEL)),
})

NOW_ACTIVITY_TYPES = api.model('ActivityType', {
    'activity_type_code': fields.String,
    'description': fields.String,
    'active_ind': fields.Boolean
})

APPLICATION_TYPE_CODE = api.model('ApplicationTypeCode', {
    'application_type_code': fields.String,
    'description': fields.String,
    'active_ind': fields.Boolean
})

NOW_APPLICATION_TYPES = api.model(
    'ApplicationType', {
        'notice_of_work_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

NOW_APPLICATION_STATUS_CODES = api.model(
    'ActivityStatusCodes', {
        'now_application_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

NOW_APPLICATION_STATUS_UPDATED_RECORD = api.model(
    'NOWApplicationStatusUpdatedRecord', {
        'now_number': fields.String,
        'status_updated_date': Date,
        'status': fields.Nested(NOW_APPLICATION_STATUS_CODES)
    })

UNIT_TYPES = api.model(
    'UnitTypeCodes', {
        'short_description': fields.String,
        'unit_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

NOW_APPLICATION_DOCUMENT_TYPE_MODEL = api.model(
    'ApplicationDocumentTypeModel', {
        'now_application_document_type_code': fields.String,
        'description': fields.String,
        'now_application_document_sub_type_code': fields.String,
        'document_template': fields.Nested(DOCUMENT_TEMPLATE_MODEL, skip_none=True),
        'active_ind': fields.Boolean
    })

UNDERGROUND_EXPLORATION_TYPES = api.model(
    'UndergroundExplorationTypes', {
        'underground_exploration_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

APPLICATION_PROGRESS_STATUS_CODES = api.model(
    'ApplicationProgressStatusCodes', {
        'application_progress_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer,
    })

NOW_APPLICATION_PERMIT_TYPES = api.model(
    'ApplicationPermitTypes', {
        'now_application_permit_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

NOW_APPLICATION_REVIEW_TYPES = api.model(
    'ApplicationReviewTypes', {
        'now_application_review_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

NOW_APPLICATION_DELAY_TYPE = api.model(
    'ApplicationDelayTypes', {
        'delay_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer,
    })
