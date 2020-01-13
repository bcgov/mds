ALTER TABLE sand_gravel_quarry_operation
ADD COLUMN average_overburden_depth_unit_type_code character varying(3),
ADD COLUMN average_top_soil_depth_unit_type_code character varying(3);


ALTER TABLE sand_gravel_quarry_operation
ADD FOREIGN KEY (average_overburden_depth_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED,
ADD FOREIGN KEY (average_top_soil_depth_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED;


ALTER TABLE unit_type RENAME COLUMN unit TO short_description;
UPDATE unit_type set short_description = 't' where unit_type_code = 'MTN';
UPDATE unit_type set short_description = 'm3' where unit_type_code = 'MEC';
UPDATE unit_type set short_description = 'ha' where unit_type_code = 'HA';
UPDATE unit_type set short_description = 'deg' where unit_type_code = 'DEG';
UPDATE unit_type set short_description = '%' where unit_type_code = 'PER';
UPDATE unit_type set short_description = 'm' where unit_type_code = 'MTR';

INSERT INTO unit_type
(unit_type_code, short_description, description, active_ind, create_user, update_user)
VALUES
  ('KMT', 'km', 'Kilometer ', true, 'system-mds', 'system-mds')
on conflict do nothing;
