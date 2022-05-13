-- Add missing category
INSERT INTO requirements(requirement_id, parent_requirement_id, description, display_order, create_user, update_user)
VALUES  (158, 2, 'Water Quality', 7, 'system-mds', 'system-mds');

-- Update description and assign new category as parent
UPDATE requirements SET description = 'Surface Water Quality', parent_id = 158, display_order = 1 WHERE description = 'Surface Water Quality Model';
UPDATE requirements SET description = 'Groundwater Quality', parent_id = 158, display_order = 2 WHERE description = 'Groundwater Model';
