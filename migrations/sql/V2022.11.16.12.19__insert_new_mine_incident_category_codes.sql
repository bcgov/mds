-- Update legacy category codes to "is_historic"
UPDATE mine_incident_category 
SET is_historic = TRUE WHERE mine_incident_category_code IN ('H&S', 'GTC', 'ENV', 'SPI');

-- Insert new top level category codes
INSERT INTO mine_incident_category
  (mine_incident_category_code, description, active_ind, create_user, update_user, display_order, parent_mine_incident_category_code)
VALUES
  ('GT1', 'Geotechnical', TRUE, 'system-mds', 'system-mds', 50, NULL),
  ('DMD', 'Dam/Dike', TRUE, 'system-mds', 'system-mds', 60, NULL),
  ('HSP', 'Hoisting Plant', TRUE, 'system-mds', 'system-mds', 70, NULL),
  ('DFG', 'Dust, Fumes & Gasses', TRUE, 'system-mds', 'system-mds', 80, NULL),
  ('MBE', 'Mobile Equipment', TRUE, 'system-mds', 'system-mds', 90, NULL),
  ('BLT', 'Blasting', TRUE, 'system-mds', 'system-mds', 100, NULL),
  ('ELC', 'Electrical', TRUE, 'system-mds', 'system-mds', 110, NULL),
  ('VNT', 'Ventilation', TRUE, 'system-mds', 'system-mds', 120, NULL),
  ('WAH', 'Working at Height', TRUE, 'system-mds', 'system-mds', 130, NULL),
  ('EV1', 'Environmental', TRUE, 'system-mds', 'system-mds', 140, NULL),
  ('FNE', 'Fire (not Electrical or Mobile Equipment)', TRUE, 'system-mds', 'system-mds', 150, NULL),
  ('OTH', 'Other Unusual Incident', TRUE, 'system-mds', 'system-mds', 160, NULL);

-- Insert new child category codes
INSERT INTO mine_incident_category
  (mine_incident_category_code, description, active_ind, create_user, update_user, display_order, parent_mine_incident_category_code)
VALUES
  ('FOG', 'Fall of ground', TRUE, 'system-mds', 'system-mds', 170, 'GT1'),
  ('USF', 'Unstable face', TRUE, 'system-mds', 'system-mds', 180, 'GT1'),
  ('IRD', 'In-rush of water, debris, or mud', TRUE, 'system-mds', 'system-mds', 190, 'GT1'),

  ('COS', 'Cracking or subsistence', TRUE, 'system-mds', 'system-mds', 200, 'DMD'),
  ('UES', 'Unexpected seepage', TRUE, 'system-mds', 'system-mds', 210, 'DMD'),
  ('LOF', 'Loss of freeboard', TRUE, 'system-mds', 'system-mds', 220, 'DMD'),
  ('WOE', 'Washout or erosion', TRUE, 'system-mds', 'system-mds', 230, 'DMD'),

  ('NEG', 'Noxious, or explosive gas', TRUE, 'system-mds', 'system-mds', 240, 'DFG'),
  ('DST', 'Dust', TRUE, 'system-mds', 'system-mds', 250, 'DFG'),
  ('CHM', 'Chemical', TRUE, 'system-mds', 'system-mds', 260, 'DFG'),
  ('EXP', 'Explosion', TRUE, 'system-mds', 'system-mds', 270, 'DFG'),

  ('CLN', 'Collision', TRUE, 'system-mds', 'system-mds', 280, 'MBE'),
  ('OOC', 'Out of control', TRUE, 'system-mds', 'system-mds', 290, 'MBE'),
  ('RLO', 'Roll-over', TRUE, 'system-mds', 'system-mds', 300, 'MBE'),
  ('FR1', 'Fire', TRUE, 'system-mds', 'system-mds', 310, 'MBE'),
  ('OVI', 'Other vehicle-related incidents', TRUE, 'system-mds', 'system-mds', 320, 'MBE'),

  ('FAC', 'Finding a cap', TRUE, 'system-mds', 'system-mds', 330, 'BLT'),
  ('FEX', 'Finding explosives', TRUE, 'system-mds', 'system-mds', 340, 'BLT'),
  ('MSF', 'Misfires', TRUE, 'system-mds', 'system-mds', 350, 'BLT'),
  ('UCB', 'Uncontrolled blast (overpressure, fly rock, no signal, blast zone breach)', TRUE, 'system-mds', 'system-mds', 360, 'BLT'),

  ('SHK', 'Shock', TRUE, 'system-mds', 'system-mds', 370, 'ELC'),
  ('FR2', 'Fire', TRUE, 'system-mds', 'system-mds', 380, 'ELC'),
  ('AFH', 'Arc flash', TRUE, 'system-mds', 'system-mds', 390, 'ELC'),

  ('STP', 'Stoppage', TRUE, 'system-mds', 'system-mds', 400, 'VNT'),
  ('SMK', 'Smoke', TRUE, 'system-mds', 'system-mds', 410, 'VNT'),
  ('CCL', 'Circulation', TRUE, 'system-mds', 'system-mds', 420, 'VNT'),
  ('SGR', 'Stench gas released', TRUE, 'system-mds', 'system-mds', 430, 'VNT'),

  ('FOJ', 'Falling objects', TRUE, 'system-mds', 'system-mds', 420, 'WAH'),
  ('FWK', 'Falling workers', TRUE, 'system-mds', 'system-mds', 430, 'WAH'),

  ('WAN', 'Wild animal', TRUE, 'system-mds', 'system-mds', 440, 'EV1'),
  ('WTR', 'Weather', TRUE, 'system-mds', 'system-mds', 450, 'EV1'),
  ('AOS', 'Avalanche, or Snow', TRUE, 'system-mds', 'system-mds', 460, 'EV1'),
  ('FLD', 'Flooding', TRUE, 'system-mds', 'system-mds', 470, 'EV1'),

  ('UGF', 'Underground fire', TRUE, 'system-mds', 'system-mds', 480, 'FNE'),
  ('FTH', 'Fire that threatened persons, or equipment', TRUE, 'system-mds', 'system-mds', 490, 'FNE');
  
  