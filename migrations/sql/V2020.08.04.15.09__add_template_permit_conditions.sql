INSERT INTO standard_permit_conditions
(permit_type, condition, condition_category, condition_type, display_order, create_user, update_user)
VALUES
-- General
	('SAG', 'Compliance with Mines Act and Code', 'GEC', 'SEC', 1, 'system-mds', 'system-mds'),
	('SAG', 'Changes to Permitted Activities and Amendment of the Permit', 'GEC', 'SEC', 2, 'system-mds', 'system-mds'),
	('SAG', 'Permit Approval', 'GEC', 'SEC', 3, 'system-mds', 'system-mds'),
  ('SAG', 'Permit', 'GEC', 'SEC', 4, 'system-mds', 'system-mds'),
	('SAG', 'Mine Closure', 'GEC', 'SEC', 5, 'system-mds', 'system-mds'),
	('SAG', 'Documentation', 'GEC', 'SEC', 6, 'system-mds', 'system-mds'),

-- Health and Safety
  ('SAG', 'Mine Emergency Response Plan', 'HSC', 'SEC', 1, 'system-mds', 'system-mds'),
	('SAG', 'Fuels and Lubricant Handling, Transportation and Storage', 'HSC', 'SEC', 2, 'system-mds', 'system-mds'),

  -- Geotechnical
  ('SAG', 'Site Stability', 'GOC', 'SEC', 1, 'system-mds', 'system-mds'),

   -- Environmental Land and Watercourses Conditions
  ('SAG', 'Cultural Heritage and Resources Protection', 'ELC', 'SEC', 1, 'system-mds', 'system-mds'),
  ('SAG', 'Management of Invasive Species', 'ELC', 'SEC', 2, 'system-mds', 'system-mds'),

  -- Reclamation and Closure Program Conditions
	('SAG', 'Security', 'RCC', 'SEC', 1, 'system-mds', 'system-mds'),
	('SAG', 'Obligation to Reclaim', 'RCC', 'SEC', 2, 'system-mds', 'system-mds'),
	('SAG', 'Watercourses and Aquatic Ecosystem Protection', 'RCC', 'SEC', 3, 'system-mds', 'system-mds'),
  ('SAG', 'Roads', 'RCC', 'SEC', 4, 'system-mds', 'system-mds'),
on conflict do nothing;