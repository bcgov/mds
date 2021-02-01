ALTER TABLE water_supply_detail ADD COLUMN estimate_rate_unit_type_code character varying(3);

ALTER TABLE ONLY water_supply_detail ADD CONSTRAINT estimate_rate_unit_type_code_fkey FOREIGN KEY (estimate_rate_unit_type_code) REFERENCES unit_type(unit_type_code);


INSERT INTO unit_type
(unit_type_code, short_description, description, active_ind, create_user, update_user)
VALUES
     ('MES', 'm3/s', 'Meters cubed/s', true, 'system-mds', 'system-mds'),
     ('MED', 'm3/day', 'Meters cubed/day', true, 'system-mds', 'system-mds')
on conflict do nothing;