ALTER TABLE activity_detail
ADD COLUMN disturbed_area_unit_type_code character varying(3),
ADD COLUMN timber_volume_unit_type_code character varying(3),
ADD COLUMN width_unit_type_code character varying(3),
ADD COLUMN length_unit_type_code character varying(3),
ADD COLUMN depth_unit_type_code character varying(3),
ADD COLUMN height_unit_type_code character varying(3),
ADD COLUMN cut_line_length_unit_type_code character varying(3);

ALTER TABLE activity_detail
ADD FOREIGN KEY (disturbed_area_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED,
ADD FOREIGN KEY (timber_volume_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED,
ADD FOREIGN KEY (width_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED,
ADD FOREIGN KEY (length_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED,
ADD FOREIGN KEY (depth_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED,
ADD FOREIGN KEY (height_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED,
ADD FOREIGN KEY (cut_line_length_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED;