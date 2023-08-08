import { IdefaultActivity } from ".";

export interface IsandGravelQuarry extends IdefaultActivity {
  average_overburden_depth: number;
  average_top_soil_depth: number;
  stability_measures_description: string;
  is_agricultural_land_reserve: boolean;
  agri_lnd_rsrv_permit_application_number: string;
  has_local_soil_removal_bylaw: boolean;
  community_plan: string;
  land_use_zoning: string;
  proposed_land_use: string;
  total_mineable_reserves: number;
  total_mineable_reserves_unit_type_code: string;
  total_annual_extraction: number;
  total_annual_extraction_unit_type_code: string;
  average_groundwater_depth: number;
  has_groundwater_from_existing_area: boolean;
  has_groundwater_from_test_pits: boolean;
  has_groundwater_from_test_wells: boolean;
  groundwater_from_other_description: string;
  groundwater_protection_plan: string;
  nearest_residence_distance: number;
  nearest_residence_distance_unit_type_code: string;
  nearest_water_source_distance: number;
  nearest_water_source_distance_unit_type_code: string;
  noise_impact_plan: string;
  secure_access_plan: string;
  dust_impact_plan: string;
  visual_impact_plan: string;
  reclamation_backfill_detail: string;
  calculated_total_disturbance: number;
}
