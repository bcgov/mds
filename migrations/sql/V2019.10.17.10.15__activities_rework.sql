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
  description      varchar(50),
  active_ind       boolean DEFAULT true NOT NULL,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

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

CREATE TABLE IF NOT EXISTS exploration_surface_drilling  (
  activity_id   INTEGER PRIMARY KEY, 
  reclamation_core_storage      varchar(4000),
    
  FOREIGN KEY (activity_id) REFERENCES activity(activity_id)
  DEFERRABLE INITIALLY DEFERRED
);
