CREATE TABLE cut_lines_polarization_survey(
  cut_lines_polarization_survey_id SERIAL PRIMARY KEY,
  permit_application_id integer,
  reclamation_description character varying(4000),
  reclamation_cost numeric(10,2),
  total_disturbed_area numeric(14,2),
  total_disturbed_area_unit_type_code character varying(3),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (total_disturbed_area_unit_type_code) REFERENCES unit_type(total_disturbed_area_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE cut_lines_polarization_survey IS 'A list related to a Notice of Work activity - Cut Lines and Induced Polarization Survey';


CREATE TABLE equipment_assignment (
  equipment_assignment_id SERIAL PRIMARY KEY,
  permit_application_id integer,
  equipment_assignment_type_code character varying(3),
  equipment_id integer,

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (equipment_assignment_type_code) REFERENCES equipment_assignment_type(equipment_assignment_type_code)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id)
  DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE equipment_assignment IS 'Records that relates equpment to a permit application';

CREATE TABLE settling_pond (
  settling_pond_id SERIAL PRIMARY KEY,
  proponent_pond_name character varying(4000),
  water_source_description character varying(4000),
  total_disturbed_area numeric(14,2),
  total_disturbed_unit_type_code character varying(3),
  reclamation_description character varying(4000),
  reclamation_cost numeric(10,2),
  construction_plan character varying(4000),
  is_ponds_exfiltrated boolean,
  is_ponds_recycled boolean,
  is_ponds_discharged boolean,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (total_disturbed_unit_type_code) REFERENCES unit_type(total_disturbed_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE settling_pond IS 'A list related to a Notice of Work activity - Settling Pond';

CREATE TABLE water_supply (
  water_supply_id SERIAL PRIMARY KEY,
  permit_application_id  integer,
  supply_source_description varchar(4000),
  supply_source_type varchar(4000),
  water_use_description varchar(4000),
  estimate_rate numeric(14,2),
  pump_size numeric(14,2),
  intake_location varchar(4000),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE water_supply IS 'A list related to a Notice of Work activity - Water Supply';


CREATE TABLE application_settling_pond_xref (
  permit_application_id integer,
  settling_pond_id integer,
  is_existing_pond boolean

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (settling_pond_id) REFERENCES settling_pond(settling_pond_id)
  DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE application_settling_pond_xref IS 'Record connecting proposed and existing settling ponds to a permit application';


CREATE TABLE permit_application (
  permit_application_id  SERIAL PRIMARY KEY,
  permit_application_guid uuid,
  mine_guid uuid,
  now_message_id integer,
  now_tracking_number integer,
  notice_of_work_type_code character varying(3),
  application_status_code character varying(3),
  submitted_date date,
  received_date date,
  latitude numberic(9,7),
  longitude numberic(11,7),
  property_name character varying(4000),
  tenure_number character varying(4000),
  description_of_land character varying(4000),
  proposed_start_date date,
  proposed_end_date date,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (notice_of_work_type_code) REFERENCES notice_of_work_type(notice_of_work_type_code)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (application_status_code) REFERENCES application_status(application_status_code)
  DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE permit_application IS 'A list of notice of work permit applications';


CREATE TABLE exploration_surface_drilling (
  exploration_surface_drilling_id SERIAL PRIMARY KEY,
  permit_application_id integer,
  reclamation_description character varying(4000),
  reclamation_core_storage character varying(4000),
  reclamation_cost numeric(10,2),
  total_disturbed_area numeric(14,2),
  total_disturbed_area_unit_type_code character varying(3),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE exploration_surface_drilling IS 'A list related to a Notice of Work activity - Exploration Surface Drilling';


CREATE TABLE sand_gravel_quarry_operation (
  sand_gravel_quarry_operation_id SERIAL PRIMARY KEY,
  permit_application_id integer,
  average_overburden_depth numeric(14,2),
  average_top_soil_depth numeric(14,2),
  stability_measures_description character varying(4000),
  is_agricultural_land_reserve bolean,
  permit_application_number character varying(300),
  has_local_soil_removal_bylaw boolean,
  community_plan character varying(4000),
  land_use_zoning character varying(4000),
  proposed_land_use character varying(4000),
  total_minable_reserves integer,
  total_minable_reserves_unit_type_code character varying(3),
  total_annual_extraction integer,
  total_annual_extraction_unit_type_code character varying(3),
  total_disturbed_area numeric(14,2),
  total_disturbed_area_unit_type_code character varying(3),
  reclamation_description character varying(4000),
  reclamation_backfill_detail character varying(4000),
  reclamation_cost numeric(10,2),
  average_groundwater_depth numeric(14,1),
  has_groundwater_from_existing_area boolean,
  has_groundwater_from_test_pits boolean,
  has_groundwater_from_test_wells boolean,
  groundwater_from_other_description character varying(4000),
  groundwater_protection_plan character varying(4000),
  nearest_residence_distance integer,
  nearest_residence_distance_unit_type_code character varying(3),
  nearest_water_source_distance integer,
  nearest_water_source_distance_unit_type_code character varying(3),
  noise_impact_plan character varying(4000),
  secure_access_plan character varying(4000),
  dust_impact_plan character varying(4000),
  visual_impact_plan character varying(4000),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (total_minable_reserves_unit_type_code) REFERENCES unit_type(total_minable_reserves_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (total_annual_extraction_unit_type_code) REFERENCES unit_type(total_annual_extraction_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (total_disturbed_area_unit_type_code) REFERENCES unit_type(total_disturbed_area_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (nearest_residence_distance_unit_type_code) REFERENCES unit_type(nearest_residence_distance_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (nearest_water_source_distance_unit_type_code) REFERENCES unit_type(nearest_water_source_distance_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE sand_gravel_quarry_operation IS 'A list related to a Notice of Work activity - Sand and Gravel / Quarry Operations';

CREATE TABLE placer_operation (
  placer_operation_id SERIAL PRIMARY KEY,
  is_underground boolean,
  is_hand_operation boolean,
  reclamation_area numeric(14,2),
  reclamation_unit_type_code character varying(3),
  reclamation_cost numeric(10,2),
  reclamation_description character varying(4000),
  total_disturbed_area numeric(14,2),
  total_disturbed_area_unit_type_code character varying(3),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (total_disturbed_area_unit_type_code) REFERENCES unit_type(total_disturbed_area_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (reclamation_unit_type_code) REFERENCES unit_type(reclamation_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE placer_operation IS 'A list related to a Notice of Work activity - Placer Operations';

CREATE TABLE equipment (
  equipment_id SERIAL PRIMARY KEY,
  description character varying(4000),
  quantity integer,
  capacity character varying(4000),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
);

COMMENT ON TABLE equipment IS 'A list of physical equipment present on a mine site';

CREATE TABLE exploration_access (
  exploration_access_id SERIAL PRIMARY KEY,
  permit_application_id integer,
  reclamation_description character varying(4000),
  reclamation_cost numeric(10,2),
  total_disturbed_area numeric(14,2),
  total_disturbed_area_unit_type_code character varying(3),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (total_disturbed_area_unit_type_code) REFERENCES unit_type(total_disturbed_area_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
);

COMMENT ON TABLE exploration_access IS 'A list related to a Notice of Work activity - Access Roads, trails, Help Pads, Air Strips, Boat Ramps';

CREATE TABLE equipment_assignment_type (
  equipment_assignment_type_code character varying(3),
  description character varying(100),
  active_ind boolean,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE equipment_assignment_type IS 'A code table for the type of equipment';

CREATE TABLE underground_exploration (
  underground_exploration_id SERIAL PRIMARY KEY,
  permit_application_id integer,
  total_ore_amount integer,
  total_ore_unit_type_code character varying(20),
  total_waste_amount integer,
  total_waste_unit_type_code character varying(20),
  reclamation_description character varying(4000),
  reclamation_cost numeric(10,2),
  total_disturbed_area numeric(14,2),
  total_disturbed_area_unit_type_code character varying(3),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (total_disturbed_area_unit_type_code) REFERENCES unit_type(total_disturbed_area_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
);

COMMENT ON TABLE underground_exploration IS 'A list related to a Notice of Work activity - Underground Exploration';

CREATE TABLE camp (
  camp_id SERIAL PRIMARY KEY,
  permit_application_id integer,
  camp_name character varying,
  camp_nunmber_people character varying,
  camp_number_structures character varying,
  has_fuel_stored boolean,
  has_fuel_stored_in_bulk boolean,
  has_fuel_stored_in_barrels boolean,
  volume_fuel_stored integer,
  reclamation_description character varying(4000),
  reclamation_cost numeric(10,2),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  total_disturbed_area numeric(14,2),
  total_disturbed_area_unit_type_code character varying(3),

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (total_disturbed_area_unit_type_code) REFERENCES unit_type(total_disturbed_area_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
);

COMMENT ON TABLE camp IS 'A list related to a Notice of Work activity - Camps, Buildings, Staging Area, Fuel/Lubricant Storage';


CREATE TABLE state_of_land (
  state_of_land_id SERIAL PRIMARY KEY,
  permit_application_id integer,
  has_community_water_shed boolean,
  has_archaeology_sites_affected boolean,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE state_of_land IS 'Information related to the state of land at the time a Notice of Work is submitted';


CREATE TABLE mechanical_trenching (
  mechanical_trenching_id SERIAL PRIMARY KEY,
  permit_application_id integer,
  total_disturbed_area numeric(14,2),
  total_disturbed_area_unit_type_code character varying(3),
  reclamation_description character varying(4000),
  reclamation_cost numeric(10,2),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (total_disturbed_area_unit_type_code) REFERENCES unit_type(total_disturbed_area_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
);

COMMENT ON TABLE mechanical_trenching IS 'A list related to a Notice of Work activity - Mechanical Trenching / Test Pits';


CREATE TABLE surface_bulk_sample  (
  surface_bulk_sample_id SERIAL PRIMARY KEY,
  permit_application_id integer,
  processing_method_description character varying(4000),
  handling_instructions character varying(4000),
  reclamation_description character varying(4000),
  drainage_mitigation_description character varying(4000),
  reclamation_cost numeric(10,2),
  total_disturbed_area numeric(14,2),
  total_disturbed_area_unit_type_code  character varying(3),
  create_user character varying(60) NOT NULL,
  create_timestamp character varying(60) NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp character varying(60) NOT NULL,

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (total_disturbed_area_unit_type_code) REFERENCES unit_type(total_disturbed_area_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
);

COMMENT ON TABLE surface_bulk_sample IS 'A list related to a Notice of Work activity - Surface Bulk Sample';


CREATE TABLE unit_type (
  unit_type_code character varying(3),
  unit character varying(100),
  description character varying(100),
  active_ind boolean,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE unit_type IS 'A code table containing unit values ie tonne, percent, etc';

CREATE TABLE activity_detail (
  activity_detail_id SERIAL PRIMARY KEY,
  activity_type_description character varying(4000),
  disturbed_area numeric(14,2),
  timber_volume numeric(14,2),
  number_of_sites integer,
  width integer,
  length integer,
  depth integer,
  quantity integer,
  incline numeric(14,2),
  incline_unit_type_code character varying(3),
  cut_line_length integer,
  water_quantity integer,
  water_quantity_unit_type_code character varying(3),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (incline_unit_type_code) REFERENCES unit_type(incline_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (water_quantity_unit_type_code) REFERENCES unit_type(water_quantity_unit_type_code)
  DEFERRABLE INITIALLY DEFERRED,
);

COMMENT ON TABLE activity_detail IS 'Coomon details related to activities on a Notice of Work';


CREATE TABLE application_placer_xref (
  permit_application_id integer,
  placer_operation_id integer,
  is_existing_placer_activity boolean

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (placer_operation_id) REFERENCES placer_operation(placer_operation_id)
  DEFERRABLE INITIALLY DEFERRED,
);

COMMENT ON TABLE application_placer_xref IS 'Record connecting existing and proposed placer operations to a notice of work permit application';


CREATE TABLE blasting_operation (
  blasting_operation_id SERIAL PRIMARY KEY,
  permit_application_id integer,
  has_storage_explosive_on_site  boolean,
  explosive_permit_issued boolean,
  explosive_permit_number character varying(300),
  explosive_permit_expiry_date date,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (permit_application_id) REFERENCES permit_application(permit_application_id)
  DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE blasting_operation IS 'A list related to a Notice of Work activity - Blasting';


CREATE TABLE activity_detail_xref (
  activity_detail_xref_id SERIAL PRIMARY KEY,
  activity_detail_id integer,
  exploration_access_id integer,
  camp_id integer,
  surface_bulk_sample_id integer,
  cut_lines_polorization_survey_id integer,
  exploration_surface_drilling_id integer,
  mechanical_trenching_id integer,
  placer_operation_id integer,
  sand_gravel_quarry_operation_id integer,
  underground_exploration_id integer,
  settling_pond_id integer,

  FOREIGN KEY (activity_detail_id) REFERENCES activity_detail(activity_detail_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (exploration_access_id) REFERENCES exploration_access(exploration_access_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (camp_id) REFERENCES camp_id(camp_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (cut_lines_polorization_survey_id) REFERENCES cut_lines_polorization_survey(cut_lines_polorization_survey_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (exploration_surface_drilling_id) REFERENCES exploration_surface_drilling(exploration_surface_drilling_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (mechanical_trenching_id) REFERENCES mechanical_trenching(mechanical_trenching_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (placer_operation_id) REFERENCES placer_operation(placer_operation_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (sand_gravel_quarry_operation_id) REFERENCES sand_gravel_quarry_operation(sand_gravel_quarry_operation_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (underground_exploration_id) REFERENCES underground_exploration(underground_exploration_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (settling_pond_id) REFERENCES settling_pond(settling_pond_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (surface_bulk_sample_id) REFERENCES surface_bulk_sample(surface_bulk_sample_id)
  DEFERRABLE INITIALLY DEFERRED,
);

COMMENT ON TABLE activity_detail_xref IS 'Records connecting activity details to the associated activity';

CREATE TABLE notice_of_work_type (
  notice_of_work_type_code character varying(3),
  permit_prefix character varying(2),
  description character varying(100),
  active_ind boolean,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE notice_of_work_type IS 'A code table containing the notice of work type codes and values';

CREATE TABLE application_status (
  application_status_code character varying(3),
  description character varying(100),
  active_ind boolean,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE application_status IS 'A code table containing the application status codes and values';
