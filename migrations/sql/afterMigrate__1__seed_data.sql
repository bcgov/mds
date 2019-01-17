/***
Seed data on tables.
Runs at the end of each migration.

NOTE: If you add a new entry here, don't forget to update the flask delete_data command
***/


INSERT INTO permit_status_code
    (
    permit_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('O', 'Open permit', 10, 'system-mds', 'system-mds'),
    ('C', 'Closed Permit', 20, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO party_type_code
    (
    party_type_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('PER', 'Person', 10, 'system-mds', 'system-mds'),
    ('ORG', 'Organization', 20, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

-- Note: Any changes to the mine_operation_status_code, mine_operation_status_reason_code,
-- and mine_operation_status_sub_reason_code, will require changes to the app/api/constants.py file.
INSERT INTO mine_operation_status_code
    (
    mine_operation_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('ABN', 'Abandoned', 10, 'system-mds', 'system-mds'),
    ('CLD', 'Closed', 20, 'system-mds', 'system-mds'),
    ('NS', 'Not Started', 30, 'system-mds', 'system-mds'),
    ('OP', 'Operating', 40, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mine_operation_status_reason_code
    (
    mine_operation_status_reason_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('CM', 'Care & Maintenance', 10, 'system-mds', 'system-mds'),
    ('REC', 'Reclamation', 20, 'system-mds', 'system-mds'),
    ('ORP', 'Orphaned', 30, 'system-mds', 'system-mds'),
    ('UN', 'Unknown', 40, 'system-mds', 'system-mds'),
    ('YR', 'Year round', 50, 'system-mds', 'system-mds'),
    ('SEA', 'Seasonal', 60, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mine_operation_status_sub_reason_code
    (
    mine_operation_status_sub_reason_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('LTM', 'Long Term Maintenance', 10, 'system-mds', 'system-mds'),
    ('LWT', 'Long Term Maintenance & Water Treatment', 20, 'system-mds', 'system-mds'),
    ('PRP', 'Permit Release Pending', 30, 'system-mds', 'system-mds'),
    ('RNS', 'Reclamation Not Started', 40, 'system-mds', 'system-mds'),
    ('SVR', 'Site Visit Required', 50, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


INSERT INTO mine_region_code
    (
    mine_region_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('SW', 'South West Region', 10, 'system-mds', 'system-mds'),
    ('SC', 'South Central Region', 20, 'system-mds', 'system-mds'),
    ('NW', 'North West Region', 30, 'system-mds', 'system-mds'),
    ('NE', 'North East Region', 40, 'system-mds', 'system-mds'),
    ('SE', 'South East Region', 50, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


INSERT INTO mine_expected_document_status
    (
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('Not Received', 10, 'system-mds', 'system-mds'),
    ('Received / Pending Review', 20, 'system-mds', 'system-mds'),
    ('Review In Progress', 30, 'system-mds', 'system-mds'),
    ('Accepted', 40, 'system-mds', 'system-mds'),
    ('Rejected / Waiting On Update', 50, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mine_tenure_type_code
    (
    mine_tenure_type_code,
    description,
    active_ind,
    create_user,
    update_user
    )
VALUES
    ('COL', 'Coal', TRUE, 'system-mds', 'system-mds'),
    ('MIN', 'Mineral', TRUE, 'system-mds', 'system-mds'),
    ('PLR', 'Placer', TRUE, 'system-mds', 'system-mds'),
    ('BCL', 'BC Land', TRUE, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mine_party_appt_type_code
    (
    mine_party_appt_type_code,
    description,
    display_order,
    create_user,
    update_user,
    person,
    organization,
    grouping_level
    )
VALUES
    ('MMG', 'Mine Manager', 1, 'system-mds', 'system-mds', 'true', 'false', 3),
    ('PMT', 'Permittee', 2, 'system-mds', 'system-mds', 'true', 'true', 3),
    ('MOR', 'Mine Operator', 3, 'system-mds', 'system-mds', 'true', 'false', 3),
    ('MOW', 'Mine Owner', 4, 'system-mds', 'system-mds', 'true', 'false', 3),
    ('EOR', 'Engineer Of Record', 5, 'system-mds', 'system-mds', 'true', 'false', 2),
    ('EVS', 'Environmental Specialist', 6, 'system-mds', 'system-mds', 'true', 'false', 2),
    ('EMM', 'Exploration Mine Manager', 7, 'system-mds', 'system-mds', 'true', 'false', 2),
    ('SVR', 'Supervisor', 8, 'system-mds', 'system-mds', 'true', 'false', 1),
    ('SHB', 'Shift Boss', 9, 'system-mds', 'system-mds', 'true', 'false', 1),
    ('FRB', 'Fire Boss', 10, 'system-mds', 'system-mds', 'true', 'false', 1),
    ('BLA', 'Blaster', 11, 'system-mds', 'system-mds', 'true', 'false', 1),
    ('MRC', 'Mine Rescue Contact', 12, 'system-mds', 'system-mds', 'true', 'false', 1)
ON CONFLICT DO NOTHING;

INSERT INTO mine_disturbance_code
    (
    mine_disturbance_code,
    description,
    active_ind,
    create_user,
    update_user
    )
VALUES
    ('SUR', 'Surface', TRUE, 'system-mds', 'system-mds'),
    ('UND', 'Underground', TRUE, 'system-mds', 'system-mds'),
    ('CWA', 'Coal Wash', TRUE, 'system-mds', 'system-mds'),
    ('MIL', 'Mill', TRUE, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mine_commodity_code
    (
    mine_commodity_code,
    description,
    active_ind,
    create_user,
    update_user
    )
VALUES
    -- Coal
    ('TO', 'Thermal Coal', TRUE, 'system-mds', 'system-mds'),
    ('MC', 'Metallurgic', TRUE, 'system-mds', 'system-mds'),
    -- BC Land
    ('CG', 'Construction Aggregate', TRUE, 'system-mds', 'system-mds'),
    ('SA', 'Sand and Gravel', TRUE, 'system-mds', 'system-mds'),
    -- Metals and Minerals
    ('AE', 'Agate', TRUE, 'system-mds', 'system-mds'),
    ('AL', 'Aluminum', TRUE, 'system-mds', 'system-mds'),
    ('AI', 'Alunite', TRUE, 'system-mds', 'system-mds'),
    ('AM', 'Amber', TRUE, 'system-mds', 'system-mds'),
    ('AY', 'Amethyst', TRUE, 'system-mds', 'system-mds'),
    ('AD', 'Andalusite', TRUE, 'system-mds', 'system-mds'),
    ('AA', 'Andesite', TRUE, 'system-mds', 'system-mds'),
    ('AN', 'Anhydrite', TRUE, 'system-mds', 'system-mds'),
    ('SB', 'Antimony', TRUE, 'system-mds', 'system-mds'),
    ('AP', 'Apatite', TRUE, 'system-mds', 'system-mds'),
    ('AR', 'Argillite', TRUE, 'system-mds', 'system-mds'),
    ('AS', 'Arsenic', TRUE, 'system-mds', 'system-mds'),
    ('AB', 'Asbestos', TRUE, 'system-mds', 'system-mds'),
    ('BA', 'Barite', TRUE, 'system-mds', 'system-mds'),
    ('BN', 'Bentonite', TRUE, 'system-mds', 'system-mds'),
    ('BY', 'Beryl', TRUE, 'system-mds', 'system-mds'),
    ('BE', 'Beryllium', TRUE, 'system-mds', 'system-mds'),
    ('BI', 'Bismuth', TRUE, 'system-mds', 'system-mds'),
    ('BM', 'Bitumen', TRUE, 'system-mds', 'system-mds'),
    ('BS', 'Building Stone', TRUE, 'system-mds', 'system-mds'),
    ('CD', 'Cadmium', TRUE, 'system-mds', 'system-mds'),
    ('CA', 'Calcium', TRUE, 'system-mds', 'system-mds'),
    ('CI', 'Celestite', TRUE, 'system-mds', 'system-mds'),
    ('CC', 'Ceramic Clay', TRUE, 'system-mds', 'system-mds'),
    ('CE', 'Cerium', TRUE, 'system-mds', 'system-mds'),
    ('CS', 'Cesium', TRUE, 'system-mds', 'system-mds'),
    ('CR', 'Chromium', TRUE, 'system-mds', 'system-mds'),
    ('CH', 'Chrysotile', TRUE, 'system-mds', 'system-mds'),
    ('CY', 'Clay', TRUE, 'system-mds', 'system-mds'),
    ('CO', 'Cobalt', TRUE, 'system-mds', 'system-mds'),
    ('CU', 'Copper', TRUE, 'system-mds', 'system-mds'),
    ('CM', 'Corundum', TRUE, 'system-mds', 'system-mds'),
    ('DI', 'Diamond', TRUE, 'system-mds', 'system-mds'),
    ('DE', 'Diatomite', TRUE, 'system-mds', 'system-mds'),
    ('DS', 'Dimension Stone', TRUE, 'system-mds', 'system-mds'),
    ('DO', 'Dolomite', TRUE, 'system-mds', 'system-mds'),
    ('DY', 'Dysprosium', TRUE, 'system-mds', 'system-mds'),
    ('ER', 'Erbium', TRUE, 'system-mds', 'system-mds'),
    ('EU', 'Europium', TRUE, 'system-mds', 'system-mds'),
    ('EV', 'Evaporites', TRUE, 'system-mds', 'system-mds'),
    ('ES', 'Expanding Shale', TRUE, 'system-mds', 'system-mds'),
    ('FD', 'Feldspar', TRUE, 'system-mds', 'system-mds'),
    ('FC', 'Fireclay', TRUE, 'system-mds', 'system-mds'),
    ('FS', 'Flagstone', TRUE, 'system-mds', 'system-mds'),
    ('FL', 'Fluorite', TRUE, 'system-mds', 'system-mds'),
    ('FR', 'Fullers Earth', TRUE, 'system-mds', 'system-mds'),
    ('GD', 'Gadolinium', TRUE, 'system-mds', 'system-mds'),
    ('GA', 'Gallium', TRUE, 'system-mds', 'system-mds'),
    ('GN', 'Garnet', TRUE, 'system-mds', 'system-mds'),
    ('GS', 'Gemstones', TRUE, 'system-mds', 'system-mds'),
    ('GE', 'Germanium', TRUE, 'system-mds', 'system-mds'),
    ('AU', 'Gold', TRUE, 'system-mds', 'system-mds'),
    ('GR', 'Granite', TRUE, 'system-mds', 'system-mds'),
    ('GT', 'Graphite', TRUE, 'system-mds', 'system-mds'),
    ('GY', 'Gypsum', TRUE, 'system-mds', 'system-mds'),
    ('HF', 'Hafnium', TRUE, 'system-mds', 'system-mds'),
    ('HS', 'Hotspring', TRUE, 'system-mds', 'system-mds'),
    ('HM', 'Hydromagnesite', TRUE, 'system-mds', 'system-mds'),
    ('IN', 'Indium', TRUE, 'system-mds', 'system-mds'),
    ('IR', 'Iridium', TRUE, 'system-mds', 'system-mds'),
    ('FE', 'Iron', TRUE, 'system-mds', 'system-mds'),
    ('JD', 'Jade/Nephrite', TRUE, 'system-mds', 'system-mds'),
    ('KA', 'Kaolinite', TRUE, 'system-mds', 'system-mds'),
    ('KY', 'Kyanite', TRUE, 'system-mds', 'system-mds'),
    ('LA', 'Lanthanum', TRUE, 'system-mds', 'system-mds'),
    ('PB', 'Lead', TRUE, 'system-mds', 'system-mds'),
    ('LS', 'Limestone', TRUE, 'system-mds', 'system-mds'),
    ('LI', 'Lithium', TRUE, 'system-mds', 'system-mds'),
    ('LU', 'Lutetium', TRUE, 'system-mds', 'system-mds'),
    ('MT', 'Magnesite', TRUE, 'system-mds', 'system-mds'),
    ('MG', 'Magnesium', TRUE, 'system-mds', 'system-mds'),
    ('MS', 'Magnesium Sulphate', TRUE, 'system-mds', 'system-mds'),
    ('MA', 'Magnetite', TRUE, 'system-mds', 'system-mds'),
    ('MN', 'Manganese', TRUE, 'system-mds', 'system-mds'),
    ('MB', 'Marble', TRUE, 'system-mds', 'system-mds'),
    ('MR', 'Marl', TRUE, 'system-mds', 'system-mds'),
    ('HG', 'Mercury', TRUE, 'system-mds', 'system-mds'),
    ('MI', 'Mica', TRUE, 'system-mds', 'system-mds'),
    ('MW', 'Mineral/Rock Wool', TRUE, 'system-mds', 'system-mds'),
    ('MO', 'Molybdenum', TRUE, 'system-mds', 'system-mds'),
    ('ND', 'Neodymium', TRUE, 'system-mds', 'system-mds'),
    ('NS', 'Nepheline Syenite', TRUE, 'system-mds', 'system-mds'),
    ('NI', 'Nickel', TRUE, 'system-mds', 'system-mds'),
    ('NB', 'Niobium', TRUE, 'system-mds', 'system-mds'),
    ('OC', 'Ochre', TRUE, 'system-mds', 'system-mds'),
    ('OL', 'Olivine', TRUE, 'system-mds', 'system-mds'),
    ('OP', 'Opal', TRUE, 'system-mds', 'system-mds'),
    ('OS', 'Osmium', TRUE, 'system-mds', 'system-mds'),
    ('PD', 'Palladium', TRUE, 'system-mds', 'system-mds'),
    ('PA', 'Peat', TRUE, 'system-mds', 'system-mds'),
    ('PE', 'Perlite', TRUE, 'system-mds', 'system-mds'),
    ('PP', 'Phosphate', TRUE, 'system-mds', 'system-mds'),
    ('PH', 'Phosphorus', TRUE, 'system-mds', 'system-mds'),
    ('PT', 'Platinum', TRUE, 'system-mds', 'system-mds'),
    ('PO', 'Potash', TRUE, 'system-mds', 'system-mds'),
    ('KK', 'Potassium', TRUE, 'system-mds', 'system-mds'),
    ('KN', 'Potassium Nitrate', TRUE, 'system-mds', 'system-mds'),
    ('PZ', 'Pozzolan', TRUE, 'system-mds', 'system-mds'),
    ('PR', 'Praseodymium', TRUE, 'system-mds', 'system-mds'),
    ('PU', 'Pumice', TRUE, 'system-mds', 'system-mds'),
    ('PY', 'Pyrochlore', TRUE, 'system-mds', 'system-mds'),
    ('PL', 'Pyrophyllite', TRUE, 'system-mds', 'system-mds'),
    ('QZ', 'Quartzite', TRUE, 'system-mds', 'system-mds'),
    ('RD', 'Radioactive Material', TRUE, 'system-mds', 'system-mds'),
    ('RA', 'Radium', TRUE, 'system-mds', 'system-mds'),
    ('RN', 'Radon', TRUE, 'system-mds', 'system-mds'),
    ('RB', 'Railroad Ballast', TRUE, 'system-mds', 'system-mds'),
    ('RS', 'Rare Earths', TRUE, 'system-mds', 'system-mds'),
    ('RE', 'Rhenium', TRUE, 'system-mds', 'system-mds'),
    ('RH', 'Rhodium', TRUE, 'system-mds', 'system-mds'),
    ('RO', 'Rhodonite', TRUE, 'system-mds', 'system-mds'),
    ('RM', 'Rubidium', TRUE, 'system-mds', 'system-mds'),
    ('RY', 'Ruby', TRUE, 'system-mds', 'system-mds'),
    ('RU', 'Ruthenium', TRUE, 'system-mds', 'system-mds'),
    ('SM', 'Samarium', TRUE, 'system-mds', 'system-mds'),
    ('SV', 'Sandstone', TRUE, 'system-mds', 'system-mds'),
    ('SP', 'Sapphire', TRUE, 'system-mds', 'system-mds'),
    ('SC', 'Scandium', TRUE, 'system-mds', 'system-mds'),
    ('SE', 'Selenium', TRUE, 'system-mds', 'system-mds'),
    ('SK', 'Sericite', TRUE, 'system-mds', 'system-mds'),
    ('SH', 'Shale', TRUE, 'system-mds', 'system-mds'),
    ('SI', 'Silica', TRUE, 'system-mds', 'system-mds'),
    ('SL', 'Sillimanite', TRUE, 'system-mds', 'system-mds'),
    ('AG', 'Silver', TRUE, 'system-mds', 'system-mds'),
    ('SG', 'Slag', TRUE, 'system-mds', 'system-mds'),
    ('ST', 'Slate', TRUE, 'system-mds', 'system-mds'),
    ('SZ', 'Soapstone', TRUE, 'system-mds', 'system-mds'),
    ('SX', 'Sodalite', TRUE, 'system-mds', 'system-mds'),
    ('NA', 'Sodium', TRUE, 'system-mds', 'system-mds'),
    ('SO', 'Sodium Carbonate', TRUE, 'system-mds', 'system-mds'),
    ('NC', 'Sodium Chloride', TRUE, 'system-mds', 'system-mds'),
    ('SS', 'Sodium Sulphate', TRUE, 'system-mds', 'system-mds'),
    ('SR', 'Strontium', TRUE, 'system-mds', 'system-mds'),
    ('SU', 'Sulphur', TRUE, 'system-mds', 'system-mds'),
    ('TC', 'Talc', TRUE, 'system-mds', 'system-mds'),
    ('TA', 'Tantalum', TRUE, 'system-mds', 'system-mds'),
    ('TE', 'Tellurium', TRUE, 'system-mds', 'system-mds'),
    ('TB', 'Terbium', TRUE, 'system-mds', 'system-mds'),
    ('TL', 'Thallium', TRUE, 'system-mds', 'system-mds'),
    ('TH', 'Thorium', TRUE, 'system-mds', 'system-mds'),
    ('TM', 'Thulium', TRUE, 'system-mds', 'system-mds'),
    ('SN', 'Tin', TRUE, 'system-mds', 'system-mds'),
    ('TI', 'Titanium', TRUE, 'system-mds', 'system-mds'),
    ('TR', 'Travertine', TRUE, 'system-mds', 'system-mds'),
    ('TT', 'Tremolite', TRUE, 'system-mds', 'system-mds'),
    ('WO', 'Tungsten', TRUE, 'system-mds', 'system-mds'),
    ('UR', 'Uranium', TRUE, 'system-mds', 'system-mds'),
    ('VA', 'Vanadium', TRUE, 'system-mds', 'system-mds'),
    ('VM', 'Vermiculite', TRUE, 'system-mds', 'system-mds'),
    ('VL', 'Volcanic Ash', TRUE, 'system-mds', 'system-mds'),
    ('VG', 'Volcanic Glass', TRUE, 'system-mds', 'system-mds'),
    ('WL', 'Wollastonite', TRUE, 'system-mds', 'system-mds'),
    ('YB', 'Ytterbium', TRUE, 'system-mds', 'system-mds'),
    ('YR', 'Yttrium', TRUE, 'system-mds', 'system-mds'),
    ('ZE', 'Zeolite', TRUE, 'system-mds', 'system-mds'),
    ('ZN', 'Zinc', TRUE, 'system-mds', 'system-mds'),
    ('ZR', 'Zirconium', TRUE, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
