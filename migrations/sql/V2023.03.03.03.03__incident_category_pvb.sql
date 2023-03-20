-- top level code that was missing from previous: no children
INSERT INTO mine_incident_category
  (mine_incident_category_code, description, active_ind, create_user, update_user, display_order, parent_mine_incident_category_code)
VALUES
  ('PVB', 'Pressure Vessel or Boiler', TRUE, 'system-mds', 'system-mds', 155, NULL);