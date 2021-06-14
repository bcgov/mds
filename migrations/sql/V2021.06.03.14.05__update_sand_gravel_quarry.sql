ALTER TABLE sand_gravel_quarry_operation
ADD COLUMN IF NOT EXISTS progressive_reclamation boolean,
ADD COLUMN IF NOT EXISTS max_unreclaimed numeric,
ADD COLUMN IF NOT EXISTS max_unreclaimed_unit_type_code character varying(3),
ADD COLUMN IF NOT EXISTS work_year_info varchar,
ADD COLUMN IF NOT EXISTS proposed_activity_description varchar,
ADD COLUMN IF NOT EXISTS average_groundwater_depth_unit_type_code character varying(3);


ALTER TABLE sand_gravel_quarry_operation
ADD FOREIGN KEY (max_unreclaimed_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED,
ADD FOREIGN KEY (average_groundwater_depth_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED;