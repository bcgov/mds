UPDATE mine_incident_category
    SET display_order = 10
    WHERE mine_incident_category_code = 'ENV';

UPDATE mine_incident_category
    SET display_order = 20
    WHERE mine_incident_category_code = 'GTC';

UPDATE mine_incident_category
    SET display_order = 30
    WHERE mine_incident_category_code = 'H&S';

UPDATE mine_incident_category
    SET display_order = 40
    WHERE mine_incident_category_code = 'SPI';


UPDATE mine_incident_category
    SET display_order = 50,
    description = 'Geotechnical',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'GT1';
UPDATE mine_incident_category
    SET display_order = 60,
    description = 'Dam/Dike',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'DMD';
UPDATE mine_incident_category
    SET display_order = 70,
    description = 'Mobile Equipment',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'MBE';
UPDATE mine_incident_category
    SET display_order = 80,
    description = 'Dust, Fumes & Gasses',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'DFG';
UPDATE mine_incident_category
    SET display_order = 90,
    description = 'Blasting',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'BLT';
UPDATE mine_incident_category
    SET display_order = 100,
    description = 'Pressure Vessel or Boiler',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'PVB';
UPDATE mine_incident_category
    SET display_order = 110,
    description = 'Fire (not electrical/mobile equipment)',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'FNE';
UPDATE mine_incident_category
    SET display_order = 120,
    description = 'Electrical',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'ELC';
UPDATE mine_incident_category
    SET display_order = 140,
    description = 'Working at Height (free fall, failed lifts, etc.)',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'WAH';
UPDATE mine_incident_category
    SET display_order = 150,
    description = 'Ventilation',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'VNT';
UPDATE mine_incident_category
    SET display_order = 160,
    description = 'Hoisting Plant',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'HSP';
UPDATE mine_incident_category
    SET display_order = 170,
    description = 'Environmental',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'EV1';
UPDATE mine_incident_category
    SET display_order = 180,
    description = 'Other',
    parent_mine_incident_category_code = NULL
    WHERE mine_incident_category_code = 'OTH';


UPDATE mine_incident_category
    SET display_order = 51,
    description = 'Fall of ground',
    parent_mine_incident_category_code = 'GT1'
    WHERE mine_incident_category_code = 'FOG';
UPDATE mine_incident_category
    SET display_order = 52,
    description = 'Slope failure/unstable face',
    parent_mine_incident_category_code = 'GT1'
    WHERE mine_incident_category_code = 'USF';
UPDATE mine_incident_category
    SET display_order = 53,
    description = 'In-rush of water, debris, or mud',
    parent_mine_incident_category_code = 'GT1'
    WHERE mine_incident_category_code = 'IRD';
UPDATE mine_incident_category
    SET display_order = 61,
    description = 'Cracking or subsidence',
    parent_mine_incident_category_code = 'DMD'
    WHERE mine_incident_category_code = 'COS';
UPDATE mine_incident_category
    SET display_order = 62,
    description = 'Unexpected seepage/springs',
    parent_mine_incident_category_code = 'DMD'
    WHERE mine_incident_category_code = 'UES';
UPDATE mine_incident_category
    SET display_order = 63,
    description = 'Loss of freeboard',
    parent_mine_incident_category_code = 'DMD'
    WHERE mine_incident_category_code = 'LOF';
UPDATE mine_incident_category
    SET display_order = 64,
    description = 'Washout or erosion',
    parent_mine_incident_category_code = 'DMD'
    WHERE mine_incident_category_code = 'WOE';
UPDATE mine_incident_category
    SET display_order = 71,
    description = 'Collision',
    parent_mine_incident_category_code = 'MBE'
    WHERE mine_incident_category_code = 'CLN';
UPDATE mine_incident_category
    SET display_order = 72,
    description = 'Unexpected movement/out of control',
    parent_mine_incident_category_code = 'MBE'
    WHERE mine_incident_category_code = 'OOC';
UPDATE mine_incident_category
    SET display_order = 73,
    description = 'Rollover',
    parent_mine_incident_category_code = 'MBE'
    WHERE mine_incident_category_code = 'RLO';
UPDATE mine_incident_category
    SET display_order = 74,
    description = 'Fire',
    parent_mine_incident_category_code = 'MBE'
    WHERE mine_incident_category_code = 'FR1';
UPDATE mine_incident_category
    SET display_order = 76,
    description = 'Other vehicle-related incidents',
    parent_mine_incident_category_code = 'MBE'
    WHERE mine_incident_category_code = 'OVI';
UPDATE mine_incident_category
    SET display_order = 81,
    description = 'Noxious/explosive/flammable/toxic/other dangerous gas',
    parent_mine_incident_category_code = 'DFG'
    WHERE mine_incident_category_code = 'NEG';
UPDATE mine_incident_category
    SET display_order = 82,
    description = 'Chemical exposure',
    parent_mine_incident_category_code = 'DFG'
    WHERE mine_incident_category_code = 'CHM';
UPDATE mine_incident_category
    SET display_order = 83,
    description = 'Ignition/explosion of gas or dust',
    parent_mine_incident_category_code = 'DFG'
    WHERE mine_incident_category_code = 'EXP';
UPDATE mine_incident_category
    SET display_order = 91,
    description = 'Explosives',
    parent_mine_incident_category_code = 'BLT'
    WHERE mine_incident_category_code = 'FEX';
UPDATE mine_incident_category
    SET display_order = 92,
    description = 'Misfires',
    parent_mine_incident_category_code = 'BLT'
    WHERE mine_incident_category_code = 'MSF';
UPDATE mine_incident_category
    SET display_order = 93,
    description = 'Uncontrolled Blast (overpressure, fly rock, no signal, blast zone breach)',
    parent_mine_incident_category_code = 'BLT'
    WHERE mine_incident_category_code = 'UCB';
UPDATE mine_incident_category
    SET display_order = 111,
    description = 'Underground fire',
    parent_mine_incident_category_code = 'FNE'
    WHERE mine_incident_category_code = 'UGF';
UPDATE mine_incident_category
    SET display_order = 112,
    description = 'Fire that threatened persons/equipment',
    parent_mine_incident_category_code = 'FNE'
    WHERE mine_incident_category_code = 'FTH';
UPDATE mine_incident_category
    SET display_order = 121,
    description = 'Shock',
    parent_mine_incident_category_code = 'ELC'
    WHERE mine_incident_category_code = 'SHK';
UPDATE mine_incident_category
    SET display_order = 122,
    description = 'Fire',
    parent_mine_incident_category_code = 'ELC'
    WHERE mine_incident_category_code = 'FR2';
UPDATE mine_incident_category
    SET display_order = 123,
    description = 'Arc Flash',
    parent_mine_incident_category_code = 'ELC'
    WHERE mine_incident_category_code = 'AFH';
UPDATE mine_incident_category
    SET display_order = 141,
    description = 'Falling objects',
    parent_mine_incident_category_code = 'WAH'
    WHERE mine_incident_category_code = 'FOJ';
UPDATE mine_incident_category
    SET display_order = 142,
    description = 'Falling workers',
    parent_mine_incident_category_code = 'WAH'
    WHERE mine_incident_category_code = 'FWK';
UPDATE mine_incident_category
    SET display_order = 151,
    description = 'Stoppage',
    parent_mine_incident_category_code = 'VNT'
    WHERE mine_incident_category_code = 'STP';
UPDATE mine_incident_category
    SET display_order = 152,
    description = 'Smoke',
    parent_mine_incident_category_code = 'VNT'
    WHERE mine_incident_category_code = 'SMK';
UPDATE mine_incident_category
    SET display_order = 153,
    description = 'Circulation',
    parent_mine_incident_category_code = 'VNT'
    WHERE mine_incident_category_code = 'CCL';
UPDATE mine_incident_category
    SET display_order = 154,
    description = 'Stench gas released',
    parent_mine_incident_category_code = 'VNT'
    WHERE mine_incident_category_code = 'SGR';
UPDATE mine_incident_category
    SET display_order = 171,
    description = 'Hazardous environmental conditions',
    parent_mine_incident_category_code = 'EV1'
    WHERE mine_incident_category_code = 'WTR';
UPDATE mine_incident_category
    SET display_order = 172,
    description = 'Wild animal',
    parent_mine_incident_category_code = 'EV1'
    WHERE mine_incident_category_code = 'WAN';
UPDATE mine_incident_category
    SET display_order = 173,
    description = 'Avalanche/snow',
    parent_mine_incident_category_code = 'EV1'
    WHERE mine_incident_category_code = 'AOS';
UPDATE mine_incident_category
    SET display_order = 174,
    description = 'Flooding',
    parent_mine_incident_category_code = 'EV1'
    WHERE mine_incident_category_code = 'FLD';
  

INSERT INTO mine_incident_category
  (mine_incident_category_code, description, active_ind, create_user, update_user, display_order, parent_mine_incident_category_code)
VALUES
  ('EQP', 'Equipment', TRUE, 'system-mds', 'system-mds', 130, NULL),
   ('OSD', 'Any other structural deficiency', TRUE, 'system-mds', 'system-mds', 65, 'DMD'),
   ('ASA', 'Autonomous or semi-autonomous', TRUE, 'system-mds', 'system-mds', 75, 'MBE'),
   ('FPB', 'Failure of pressure vessel or boiler', TRUE, 'system-mds', 'system-mds', 101, 'PVB'),
   ('CDR', 'Contact with drilling or other rotational equipment', TRUE, 'system-mds', 'system-mds', 131, 'EQP'),
   ('AHP', 'Accident involving a hoisting plant', TRUE, 'system-mds', 'system-mds', 161, 'HSP')
  ;

  DELETE FROM mine_incident_category WHERE mine_incident_category_code IN ('DST', 'FAC');