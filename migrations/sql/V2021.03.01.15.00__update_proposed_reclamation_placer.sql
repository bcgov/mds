ALTER TABLE placer_operation ADD COLUMN planned_reclamation numeric(14,2);

INSERT INTO unit_type
(unit_type_code, short_description, description, active_ind, create_user, update_user)
VALUES
  ('MEY', 'm³/year', 'Meters cubed/year', true, 'system-mds', 'system-mds')
on conflict do nothing;

UPDATE placer_operation po SET planned_reclamation = 
(SELECT total_disturbed_area FROM activity_summary asum 
WHERE po.activity_summary_id = asum.activity_summary_id);