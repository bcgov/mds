ALTER TABLE sand_gravel_quarry_operation
ADD COLUMN average_overburden_depth_unit_type_code character varying(3),
ADD COLUMN average_top_soil_depth_unit_type_code character varying(3);


ALTER TABLE sand_gravel_quarry_operation
ADD FOREIGN KEY (average_overburden_depth_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED,
ADD FOREIGN KEY (average_top_soil_depth_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY DEFERRED;


INSERT INTO unit_type
(unit_type_code, description, active_ind, create_user, update_user)
VALUES
    ('KMT', 'Kilometer ', true, 'system-mds', 'system-mds')
on conflict do nothing;