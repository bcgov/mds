ALTER TABLE placer_operation ADD COLUMN proposed_production_unit_type_code varchar;
ALTER TABLE ONLY placer_operation ADD CONSTRAINT proposed_production_unit_type_code_fkey FOREIGN KEY (proposed_production_unit_type_code) REFERENCES unit_type(unit_type_code);

INSERT INTO unit_type
(unit_type_code, short_description, description, active_ind, create_user, update_user)
VALUES
  ('MEY', 'm³/year', 'Meters cubed/year', true, 'system-mds', 'system-mds')
on conflict do nothing;

UPDATE placer_operation po SET reclamation_area = 
(SELECT total_disturbed_area FROM activity_summary asum 
WHERE po.activity_summary_id = asum.activity_summary_id);

UPDATE placer_operation SET proposed_production_unit_type_code = 'HA' WHERE proposed_production IS NOT NULL;