DROP TABLE activity_detail_xref; 
DROP TABLE mechanical_trenching;
DROP TABLE exploration_access;
DROP TABLE cut_lines_polarization_survey;

ALTER TABLE camp DROP COLUMN reclamation_description, DROP COLUMN reclamation_cost, DROP COLUMN total_disturbed_area, DROP COLUMN total_disturbed_area_unit_type_code;
ALTER TABLE exploration_surface_drilling DROP COLUMN reclamation_description, DROP COLUMN reclamation_cost, DROP COLUMN total_disturbed_area, DROP COLUMN total_disturbed_area_unit_type_code;
ALTER TABLE settling_pond DROP COLUMN reclamation_description, DROP COLUMN reclamation_cost, DROP COLUMN total_disturbed_area, DROP COLUMN total_disturbed_unit_type_code;
ALTER TABLE surface_bulk_sample DROP COLUMN reclamation_description, DROP COLUMN reclamation_cost, DROP COLUMN total_disturbed_area, DROP COLUMN total_disturbed_area_unit_type_code;
ALTER TABLE underground_exploration DROP COLUMN reclamation_description, DROP COLUMN reclamation_cost, DROP COLUMN total_disturbed_area, DROP COLUMN total_disturbed_area_unit_type_code;
ALTER TABLE placer_operation DROP COLUMN reclamation_description, DROP COLUMN reclamation_cost, DROP COLUMN total_disturbed_area, DROP COLUMN total_disturbed_area_unit_type_code;
ALTER TABLE sand_gravel_quarry_operation DROP COLUMN reclamation_description, DROP COLUMN reclamation_cost, DROP COLUMN total_disturbed_area, DROP COLUMN total_disturbed_area_unit_type_code;

CREATE TABLE IF NOT EXISTS activity_summary_type  (
  activity_summary_type_code    varchar(255) PRIMARY KEY, 
  description      varchar(255),
  active_ind       boolean DEFAULT true NOT NULL,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE activity_summary_type OWNER TO mds;

CREATE TABLE IF NOT EXISTS activity_summary  (
  activity_summary_id SERIAL PRIMARY KEY,
  activity_summary_type_code varchar(255) NOT NULL,
  now_application_id integer,
  reclamation_description character varying(4000),
  reclamation_cost numeric(10,2),
  total_disturbed_area numeric(14,2),
  total_disturbed_area_unit_type_code character varying(3),
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

  FOREIGN KEY (now_application_id) REFERENCES now_application(now_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (activity_summary_type_code) REFERENCES activity_summary_type(activity_summary_type_code)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (total_disturbed_area_unit_type_code) REFERENCES unit_type(unit_type_code)
  DEFERRABLE INITIALLY DEFERRED
);
ALTER TABLE activity_summary OWNER TO mds;

--water_supply
ALTER TABLE water_supply RENAME TO water_supply_detail;
ALTER TABLE water_supply_detail RENAME COLUMN water_supply_id TO activity_detail_id;
ALTER TABLE water_supply_detail ADD FOREIGN KEY (activity_detail_id) REFERENCES activity_detail(activity_detail_id);
ALTER TABLE water_supply_detail DROP COLUMN now_application_id;
ALTER TABLE water_supply_detail DROP COLUMN create_user;
ALTER TABLE water_supply_detail DROP COLUMN create_timestamp;
ALTER TABLE water_supply_detail DROP COLUMN update_user;
ALTER TABLE water_supply_detail DROP COLUMN update_timestamp;

--settling_pond
ALTER TABLE settling_pond RENAME COLUMN settling_pond_id TO activity_summary_id;
ALTER TABLE settling_pond ADD FOREIGN KEY (activity_summary_id) REFERENCES activity_summary(activity_summary_id);
ALTER TABLE settling_pond DROP COLUMN create_user;
ALTER TABLE settling_pond DROP COLUMN create_timestamp;
ALTER TABLE settling_pond DROP COLUMN update_user;
ALTER TABLE settling_pond DROP COLUMN update_timestamp;
ALTER TABLE settling_pond DROP COLUMN water_source_description;
ALTER TABLE settling_pond DROP COLUMN construction_plan;

CREATE TABLE IF NOT EXISTS settling_pond_detail  (
  activity_detail_id   INTEGER PRIMARY KEY REFERENCES activity_detail(activity_detail_id), 
  water_source_description      varchar(4000),
  construction_plan		varchar(4000)
);
ALTER TABLE settling_pond_detail OWNER TO mds;

--exploration_surface_drilling
CREATE TABLE IF NOT EXISTS exploration_surface_drilling  (
  activity_summary_id   INTEGER PRIMARY KEY, 
  reclamation_core_storage      varchar(4000),
    
  FOREIGN KEY (activity_id) REFERENCES activity_summary(activity_summary_id)
  DEFERRABLE INITIALLY DEFERRED
);
ALTER TABLE exploration_surface_drilling OWNER TO mds;

--sand_gravel_quarry_operation
ALTER TABLE sand_gravel_quarry_operation RENAME COLUMN sand_gravel_quarry_operation_id TO activity_summary_id;
ALTER TABLE sand_gravel_quarry_operation ADD FOREIGN KEY (activity_summary_id) REFERENCES activity_summary(activity_summary_id);
ALTER TABLE sand_gravel_quarry_operation DROP COLUMN now_application_id;
ALTER TABLE sand_gravel_quarry_operation DROP COLUMN create_user;
ALTER TABLE sand_gravel_quarry_operation DROP COLUMN create_timestamp;
ALTER TABLE sand_gravel_quarry_operation DROP COLUMN update_user;
ALTER TABLE sand_gravel_quarry_operation DROP COLUMN update_timestamp;

--underground_exploration
CREATE TABLE IF NOT EXISTS underground_exploration_type  (
  underground_exploration_type_code    varchar(3) PRIMARY KEY, 
  description      varchar(255),
  active_ind       boolean DEFAULT true NOT NULL,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE underground_exploration_type OWNER TO mds;

ALTER TABLE underground_exploration RENAME COLUMN underground_exploration_id TO activity_summary_id;
ALTER TABLE underground_exploration ADD FOREIGN KEY (activity_summary_id) REFERENCES activity_summary(activity_summary_id);
ALTER TABLE underground_exploration DROP COLUMN now_application_id;
ALTER TABLE underground_exploration DROP COLUMN create_user;
ALTER TABLE underground_exploration DROP COLUMN create_timestamp;
ALTER TABLE underground_exploration DROP COLUMN update_user;
ALTER TABLE underground_exploration DROP COLUMN update_timestamp;

--camp
ALTER TABLE camp RENAME COLUMN camp_id TO activity_summary_id;
ALTER TABLE camp ADD FOREIGN KEY (activity_summary_id) REFERENCES activity_summary(activity_summary_id);
ALTER TABLE camp DROP COLUMN now_application_id;
ALTER TABLE camp DROP COLUMN create_user;
ALTER TABLE camp DROP COLUMN create_timestamp;
ALTER TABLE camp DROP COLUMN update_user;
ALTER TABLE camp DROP COLUMN update_timestamp;

--surface_bulk_sample
ALTER TABLE surface_bulk_sample RENAME COLUMN surface_bulk_sample_id TO activity_summary_id;
ALTER TABLE surface_bulk_sample ADD FOREIGN KEY (activity_summary_id) REFERENCES activity_summary(activity_summary_id);
ALTER TABLE surface_bulk_sample DROP COLUMN now_application_id;
ALTER TABLE surface_bulk_sample DROP COLUMN create_user;
ALTER TABLE surface_bulk_sample DROP COLUMN create_timestamp;
ALTER TABLE surface_bulk_sample DROP COLUMN update_user;
ALTER TABLE surface_bulk_sample DROP COLUMN update_timestamp;

--blasting_operation
ALTER TABLE blasting_operation RENAME COLUMN blasting_operation_id TO activity_summary_id;
ALTER TABLE blasting_operation ADD FOREIGN KEY (activity_summary_id) REFERENCES activity_summary(activity_summary_id);
ALTER TABLE blasting_operation DROP COLUMN now_application_id;
ALTER TABLE blasting_operation DROP COLUMN create_user;
ALTER TABLE blasting_operation DROP COLUMN create_timestamp;
ALTER TABLE blasting_operation DROP COLUMN update_user;
ALTER TABLE blasting_operation DROP COLUMN update_timestamp;

--placer
ALTER TABLE placer_operation RENAME COLUMN placer_operation_id TO activity_summary_id;
ALTER TABLE placer_operation ADD FOREIGN KEY (activity_summary_id) REFERENCES activity_summary(activity_summary_id);
ALTER TABLE placer_operation DROP COLUMN create_user;
ALTER TABLE placer_operation DROP COLUMN create_timestamp;
ALTER TABLE placer_operation DROP COLUMN update_user;
ALTER TABLE placer_operation DROP COLUMN update_timestamp;


CREATE TABLE activity_summary_detail_xref (
	activity_summary_id INTEGER NOT NULL REFERENCES activity_summary(activity_summary_id), 
	activity_detail_id INTEGER NOT NULL REFERENCES activity_detail(activity_detail_id),
	
    PRIMARY KEY(activity_summary_id, activity_detail_id)
);
ALTER TABLE activity_summary_detail_xref OWNER TO mds;
