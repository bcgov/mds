CREATE TABLE IF NOT EXISTS exploration_access  (
  activity_summary_id SERIAL PRIMARY KEY,
  has_proposed_bridges_or_culverts boolean NOT NULL DEFAULT FALSE,
  bridge_culvert_crossing_description varchar,

  FOREIGN KEY (activity_summary_id) REFERENCES activity_summary(activity_summary_id)
  DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE now_application ADD COLUMN crown_grant_or_district_lot_numbers varchar;
ALTER TABLE now_application ADD COLUMN work_plan varchar;
ALTER TABLE now_application ADD COLUMN type_of_application varchar;

ALTER TABLE now_application ADD COLUMN has_surface_disturbance_outside_tenure boolean NOT NULL DEFAULT FALSE;
ALTER TABLE now_application ADD COLUMN is_access_gated boolean NOT NULL DEFAULT FALSE;
ALTER TABLE now_application ADD COLUMN has_key_for_inspector boolean NOT NULL DEFAULT FALSE;
ALTER TABLE now_application ADD COLUMN has_req_access_authorizations boolean NOT NULL DEFAULT FALSE;
ALTER TABLE now_application ADD COLUMN req_access_authorization_numbers varchar;

ALTER TABLE state_of_land ADD COLUMN present_land_condition_description varchar;
ALTER TABLE state_of_land ADD COLUMN means_of_access_description varchar;
ALTER TABLE state_of_land ADD COLUMN physiography_description varchar;
ALTER TABLE state_of_land ADD COLUMN old_equipment_description varchar;
ALTER TABLE state_of_land ADD COLUMN type_of_vegetation_description varchar;
ALTER TABLE state_of_land ADD COLUMN recreational_trail_use_description varchar;
ALTER TABLE state_of_land ADD COLUMN arch_site_protection_plan varchar;
ALTER TABLE state_of_land ADD COLUMN fn_engagement_activities varchar;
ALTER TABLE state_of_land ADD COLUMN cultural_heritage_description varchar;

ALTER TABLE state_of_land ADD COLUMN has_shared_info_with_fn boolean NOT NULL DEFAULT FALSE;
ALTER TABLE state_of_land ADD COLUMN has_fn_cultural_heritage_sites_in_area boolean NOT NULL DEFAULT FALSE;
ALTER TABLE state_of_land ADD COLUMN has_activity_in_park boolean NOT NULL DEFAULT FALSE;
ALTER TABLE state_of_land ADD COLUMN is_on_private_land boolean NOT NULL DEFAULT FALSE;
ALTER TABLE state_of_land ADD COLUMN has_auth_lieutenant_gov_council boolean NOT NULL DEFAULT FALSE;

ALTER TABLE settling_pond ADD COLUMN wastewater_facility_description varchar;
ALTER TABLE settling_pond ADD COLUMN disposal_from_clean_out varchar;

ALTER TABLE surface_bulk_sample ADD COLUMN has_bedrock_expansion boolean NOT NULL DEFAULT FALSE;
ALTER TABLE surface_bulk_sample ADD COLUMN surface_water_damage varchar;
ALTER TABLE surface_bulk_sample ADD COLUMN spontaneous_combustion_handling varchar;

ALTER TABLE underground_exploration ADD COLUMN proposed_activity varchar;

ALTER TABLE placer_operation ADD COLUMN proposed_production varchar;