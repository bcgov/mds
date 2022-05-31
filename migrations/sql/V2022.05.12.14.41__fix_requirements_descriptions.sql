-- Update display_order for parent section 2 before adding new category
UPDATE requirements r SET display_order = r.display_order + 1 WHERE display_order >= 7 and parent_requirement_id = 2;

-- Add missing section 2 category
INSERT INTO requirements(requirement_id, parent_requirement_id, description, display_order, create_user, update_user)
VALUES (158, 2, 'Water Quality', 7, 'system-mds', 'system-mds');

-- Add child records to newly added missing category
INSERT INTO requirements(requirement_id, parent_requirement_id, description, display_order, create_user, update_user)
VALUES
  (159, (SELECT requirement_id FROM requirements WHERE description = 'Water Quality' LIMIT 1), 'Surface Water Quality', 1, 'system-mds', 'system-mds'),
  (160, (SELECT requirement_id FROM requirements WHERE description = 'Water Quality' LIMIT 1), 'Groundwater Quality', 2, 'system-mds', 'system-mds');
