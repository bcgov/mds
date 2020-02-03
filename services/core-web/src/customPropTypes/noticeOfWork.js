import { PropTypes, shape } from "prop-types";

export const activityDetails = shape({
  activity_type_description: PropTypes.string,
  disturbed_area: PropTypes.number,
  timber_volume: PropTypes.number,
  number_of_sites: PropTypes.number,
  width: PropTypes.number,
  length: PropTypes.number,
  depth: PropTypes.number,
  height: PropTypes.number,
  quantity: PropTypes.number,
  incline: PropTypes.number,
  incline_unit_type_code: PropTypes.string,
  cut_line_length: PropTypes.number,
  water_quantity: PropTypes.number,
  water_quantity_unit_type_code: PropTypes.string,
});

export const activityEquipment = shape({
  description: PropTypes.string,
  quantity: PropTypes.number,
  capacity: PropTypes.string,
});

export const activitySummary = shape({
  reclamation_description: PropTypes.string,
  reclamation_cost: PropTypes.number,
  total_disturbed_area: PropTypes.number,
  total_disturbed_area_unit_type_code: PropTypes.string,
  equipment: activityEquipment,
});

export const defaultActivity = shape({
  details: activityDetails,
  ...activitySummary,
});

export const camps = shape({
  camp_name: PropTypes.string,
  camp_number_people: PropTypes.number,
  camp_number_structures: PropTypes.number,
  has_fuel_stored: PropTypes.boolean,
  has_fuel_stored_in_bulk: PropTypes.boolean,
  has_fuel_stored_in_barrels: PropTypes.boolean,
  ...defaultActivity,
});

const surfaceDrilling = shape({
  reclamation_core_storage: PropTypes.string,
  ...defaultActivity,
});

const placer = shape({
  is_underground: PropTypes.boolean,
  is_hand_operation: PropTypes.boolean,
  reclamation_area: PropTypes.number,
  reclamation_unit_type_code: PropTypes.string,
  ...defaultActivity,
});

export const sandGravelQuarry = shape({
  average_overburden_depth: PropTypes.number,
  average_top_soil_depth: PropTypes.number,
  stability_measures_description: PropTypes.string,
  is_agricultural_land_reserve: PropTypes.boolean,
  agri_lnd_rsrv_permit_application_number: PropTypes.string,
  has_local_soil_removal_bylaw: PropTypes.boolean,
  community_plan: PropTypes.string,
  land_use_zoning: PropTypes.string,
  proposed_land_use: PropTypes.string,
  total_mineable_reserves: PropTypes.number,
  total_mineable_reserves_unit_type_code: PropTypes.string,
  total_annual_extraction: PropTypes.number,
  total_annual_extraction_unit_type_code: PropTypes.string,
  average_groundwater_depth: PropTypes.number,
  has_groundwater_from_existing_area: PropTypes.boolean,
  has_groundwater_from_test_pits: PropTypes.boolean,
  has_groundwater_from_test_wells: PropTypes.boolean,
  groundwater_from_other_description: PropTypes.string,
  groundwater_protection_plan: PropTypes.string,
  nearest_residence_distance: PropTypes.number,
  nearest_residence_distance_unit_type_code: PropTypes.string,
  nearest_water_source_distance: PropTypes.number,
  nearest_water_source_distance_unit_type_code: PropTypes.string,
  noise_impact_plan: PropTypes.string,
  secure_access_plan: PropTypes.string,
  dust_impact_plan: PropTypes.string,
  visual_impact_plan: PropTypes.string,
  reclamation_backfill_detail: PropTypes.string,
  ...defaultActivity,
});

export const settlingPond = shape({
  proponent_pond_name: PropTypes.string,
  is_ponds_exfiltrated: PropTypes.boolean,
  is_ponds_recycled: PropTypes.boolean,
  is_ponds_discharged: PropTypes.boolean,
  ...defaultActivity,
});

export const surfaceBulkSamples = shape({
  processing_method_description: PropTypes.string,
  handling_instructions: PropTypes.string,
  drainage_mitigation_description: PropTypes.string,
  ...defaultActivity,
});

export const waterSupply = shape({
  supply_source_description: PropTypes.string,
  supply_source_type: PropTypes.string,
  water_use_description: PropTypes.string,
  estimate_rate: PropTypes.number,
  pump_size: PropTypes.number,
  intake_location: PropTypes.string,
  ...defaultActivity,
});

export const statueOfLand = shape({
  has_community_water_shed: PropTypes.boolean,
  has_archaeology_sites_affected: PropTypes.boolean,
});

export const importedNOWApplication = shape({
  now_application_guid: PropTypes.string,
  mine_guid: PropTypes.string,
  mine_name: PropTypes.string,
  mine_no: PropTypes.string,
  mine_region: PropTypes.string,
  imported_to_core: PropTypes.boolean,
  notice_of_work_type_code: PropTypes.string,
  now_application_status_code: PropTypes.string,
  submitted_date: PropTypes.date,
  received_date: PropTypes.date,
  latitude: PropTypes.string,
  longitude: PropTypes.string,
  property_name: PropTypes.string,
  tenure_number: PropTypes.string,
  description_of_land: PropTypes.string,
  proposed_start_date: PropTypes.date,
  proposed_end_date: PropTypes.date,
  directions_to_site: PropTypes.string,

  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  submission_documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  blasting_operation: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  state_of_land: statueOfLand,
  camps,
  cut_lines_polarization_survey: defaultActivity,
  exploration_access: defaultActivity,
  exploration_surface_drilling: surfaceDrilling,
  mechanical_trenching: defaultActivity,
  sand_and_gravel: sandGravelQuarry,
  settling_pond: settlingPond,
  surface_bulk_sample: surfaceBulkSamples,
  underground_exploration: defaultActivity,
  water_supply: waterSupply,
  placer_operation: placer,
});

export const NOWApplicationReview = shape({
  now_application_review_type_code: PropTypes.string,
  response_date: PropTypes.string,
  referee_name: PropTypes.string,
});
