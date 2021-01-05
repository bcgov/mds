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
    ('O', 'Open', 10, 'system-mds', 'system-mds'),
    ('C', 'Closed', 20, 'system-mds', 'system-mds'),
    ('D', 'Draft', 20, 'system-mds', 'system-mds')
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
    ('YR', 'Year-Round', 50, 'system-mds', 'system-mds'),
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
    ('LTM', 'Long-Term Maintenance', 10, 'system-mds', 'system-mds'),
    ('LWT', 'Long-Term Maintenance & Water Treatment', 20, 'system-mds', 'system-mds'),
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
    ('SW', 'South West', 10, 'system-mds', 'system-mds'),
    ('SC', 'South Central', 20, 'system-mds', 'system-mds'),
    ('NW', 'North West', 30, 'system-mds', 'system-mds'),
    ('NE', 'North East', 40, 'system-mds', 'system-mds'),
    ('SE', 'South East', 50, 'system-mds', 'system-mds')
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


--mine_party_appt_type_code seed data is in base schema and updated by V2019.01.24.08.51__add_tsf_qualified_person_mpa_type
INSERT INTO mine_party_appt_type_code (
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
    ('HSM', 'Health and Safety Manager', 111, 'system-mds', 'system-mds', 'true', 'false', 2),
    ('AGT', 'Agent', 14, 'system-mds', 'system-mds', 'true', 'true', 1)
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

--Manually insert BC LAnd and Coal Tenure types
INSERT INTO mine_commodity_tenure_type
(
    mine_commodity_code,
    mine_tenure_type_code
)
VALUES 
    ('TO','COL'),
    ('MC','COL'),
    ('CG','BCL'),
    ('SA','BCL')
ON CONFLICT DO NOTHING;
--Everything else gets Mineral tenure type
INSERT INTO mine_commodity_tenure_type
(
    mine_commodity_code,
    mine_tenure_type_code
) 
SELECT mine_commodity_code, 'MIN' from mine_commodity_code where mine_commodity_code not in ('TO','MC','CG','SA')
ON CONFLICT DO NOTHING;
--Everything else also gets Placer tenure type
INSERT INTO mine_commodity_tenure_type
(
    mine_commodity_code,
    mine_tenure_type_code
)
SELECT mine_commodity_code, 'PLR' from mine_commodity_code where mine_commodity_code not in ('TO','MC','CG','SA')
ON CONFLICT DO NOTHING;

INSERT INTO mine_disturbance_tenure_type
(
    mine_disturbance_code,
    mine_tenure_type_code
)
VALUES 
    ('SUR', 'COL'),
    ('SUR', 'MIN'),
    ('SUR', 'PLR'),
    ('SUR', 'BCL'),
    ('UND', 'COL'),
    ('UND', 'MIN'),
    ('UND', 'PLR'),
    ('CWA', 'COL'),
    ('MIL', 'PLR')
ON CONFLICT DO NOTHING;

INSERT INTO permit_amendment_type_code
    (
    permit_amendment_type_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('OGP', 'Original Permit', 10, 'system-mds', 'system-mds'),
    ('AMD', 'Permit Amendment', 20, 'system-mds', 'system-mds'),
    ('ALG', 'Amalgamated Permit', 30, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO permit_amendment_status_code
    (
    permit_amendment_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('ACT', 'Active', 10, 'system-mds', 'system-mds'),
    ('RMT', 'Remitted', 20, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


INSERT INTO mine_incident_followup_investigation_type
	(
	mine_incident_followup_investigation_type_code,
	description,
	display_order,
    active_ind,
	create_user,
	update_user
	)
VALUES
	('MIU', 'Yes - MIU Investigation', 10, 'T', 'system-mds', 'system-mds'),
	('INS', 'Yes - Inspector Investigation', 20, 'T', 'system-mds', 'system-mds'),
	('NO', 'No', 30, 'T', 'system-mds', 'system-mds'),
    ('HUK', 'Historical - Unknown', 40, 'F', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


INSERT INTO mine_incident_determination_type
(
    mine_incident_determination_type_code,
    description                          ,
    display_order                        ,
    create_user                          ,
    update_user
)
VALUES
    ('PEN', 'Pending determination', 10, 'system-mds', 'system-mds'),
    ('DO', 'This was a dangerous occurrence', 20, 'system-mds', 'system-mds'),
    ('NDO', 'This was not a dangerous occurrence', 30, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO variance_application_status_code (
    variance_application_status_code,
    description,
    create_user,
    update_user
)
VALUES
    ('REV', 'In Review', 'system-mds', 'system-mds'),
    ('NAP', 'Not Applicable', 'system-mds', 'system-mds'),
    ('APP', 'Approved', 'system-mds', 'system-mds'),
    ('DEN', 'Denied', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mine_incident_document_type_code (
    mine_incident_document_type_code,
    description,
    active_ind,
    create_user,
    update_user
)
VALUES
    ('FIN', 'Final Document', TRUE, 'system-mds', 'system-mds'),
    ('INI', 'Initial Document', TRUE,  'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mine_report_submission_status_code
    (
    mine_report_submission_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('NRQ', 'Not Requested', 10, 'system-mds', 'system-mds'),
    ('REQ', 'Changes Requested', 20, 'system-mds', 'system-mds'),
    ('REC', 'Changes Received', 30, 'system-mds', 'system-mds'),
    ('ACC', 'Accepted', 40, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


INSERT INTO public.mine_report_category
(mine_report_category, description, display_order, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES 
	('H&S', 'Health and Safety', 10, true, 'system-mds', now(), 'system-mds', now()),
	('GSE', 'Geoscience and Environmental', 20, true, 'system-mds', now(), 'system-mds', now()),
	('GTC', 'Geotechnical', 30, true, 'system-mds', now(), 'system-mds', now()),
	('OTH', 'Other', 40, true, 'system-mds', now(), 'system-mds', now())
on conflict do nothing;


INSERT INTO public.mine_report_due_date_type
(mine_report_due_date_type, description, active_ind, create_user, update_user)
VALUES
	('FIS', 'Reports due on fiscal year-end', true, 'system-mds', 'system-mds'),
	('ANV', 'Reports due on an anniversary of an operation, permit, etc.', true, 'system-mds', 'system-mds'),
	('AVA', 'Reports that are available on request', true, 'system-mds', 'system-mds'),
	('PMT', 'Reports that are indicated via permit requirements', true, 'system-mds', 'system-mds'),
	('EVT', 'Reports that are related to an event that occurred', true, 'system-mds', 'system-mds')
on conflict do nothing;

INSERT INTO unit_type
(unit_type_code, short_description, description, active_ind, create_user, update_user)
VALUES
	('MTN', 't', 'Tonne (Metric Ton 1,000 kg)', true, 'system-mds', 'system-mds'),
	('MEC', 'm3', 'Meters cubed', true, 'system-mds', 'system-mds'),
	('HA', 'ha', 'Hectares', true, 'system-mds', 'system-mds'),
	('DEG',  'deg', 'Degrees', true, 'system-mds', 'system-mds'),
    ('PER', '%', 'Grade (Percent)', true, 'system-mds', 'system-mds'),
	('MTR', 'm', 'Meters', true, 'system-mds', 'system-mds'),
    ('KMT', 'km', 'Kilometer ', true, 'system-mds', 'system-mds')
on conflict do nothing;

INSERT INTO notice_of_work_type
(notice_of_work_type_code, permit_prefix, description, active_ind, create_user, update_user)
VALUES
	('QCA', 'Q', 'Quarry - Construction Aggregate', true, 'system-mds', 'system-mds'),
	('COL', 'C', 'Coal', true, 'system-mds', 'system-mds'),
	('PLA', 'P', 'Placer Operations', true, 'system-mds', 'system-mds'),
	('MIN', 'M', 'Mineral', true, 'system-mds', 'system-mds'),
    ('SAG', 'G', 'Sand & Gravel', true, 'system-mds', 'system-mds'),
	('QIM', 'Q', 'Quarry - Industrial Mineral', true, 'system-mds', 'system-mds')
on conflict do nothing;

INSERT INTO now_application_status
(now_application_status_code, description, display_order, active_ind, create_user, update_user)
VALUES
	('REF', 'Referred', 70, true, 'system-mds', 'system-mds'),
	('CDI', 'Client Delay', 30, true, 'system-mds', 'system-mds'),
  ('GVD', 'Govt. Action Required', 60, true, 'system-mds', 'system-mds'),
  ('AIA', 'Approved', 10, true, 'system-mds', 'system-mds'),
	('REJ', 'Rejected', 80, true, 'system-mds', 'system-mds'),
  ('REC', 'Received', 90, true, 'system-mds', 'system-mds'),
  ('PAP', 'Pending Approval', 50, true, 'system-mds', 'system-mds'),
	('REI', 'Rejected-Initial', 100, true, 'system-mds', 'system-mds'),
	('PCO', 'Permit Closed', 40, true, 'system-mds', 'system-mds'),
	('NPR', 'No Permit Required', 110, true, 'system-mds', 'system-mds'),
	('RCO', 'Referral Complete', 120, true, 'system-mds', 'system-mds')
on conflict do nothing;

INSERT INTO mine_incident_category
(mine_incident_category_code, description, active_ind, create_user, update_user, display_order)
VALUES
	('H&S', 'Health and Safety', true, 'system-mds', 'system-mds', 30),
	('GTC', 'Geotechnical', true, 'system-mds', 'system-mds', 20),
	('ENV', 'Environmental', true, 'system-mds', 'system-mds', 10),
    ('SPI', 'Spill', true, 'system-mds', 'system-mds', 40)
on conflict do nothing;

INSERT INTO activity_type (
    activity_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('cut_lines_polarization_survey', 'Cut Lines and Induced Polarization Survey', 'system-mds', 'system-mds'),
    ('water_supply', 'Water Supply', 'system-mds', 'system-mds'),
    ('settling_pond', 'Settling Ponds', 'system-mds', 'system-mds'),
    ('exploration_surface_drilling', 'Exploration Surface Drilling', 'system-mds', 'system-mds'),
    ('sand_gravel_quarry_operation', 'Sand and Gravel / Quarry Operations', 'system-mds', 'system-mds'),
    ('exploration_access', 'Access Roads, Trails, Helipads, Airstrips, Boat Ramps', 'system-mds', 'system-mds'),
    ('underground_exploration', 'Underground Exploration', 'system-mds', 'system-mds'),
    ('camp', 'Camps, Buildings, Staging Area, Fuel/Lubricant Storage', 'system-mds', 'system-mds'),
    ('mechanical_trenching', 'Mechanical Trenching / Test Pits', 'system-mds', 'system-mds'),
    ('surface_bulk_sample', 'Surface Bulk Sample', 'system-mds', 'system-mds'),
    ('blasting_operation', 'Blasting Operations', 'system-mds', 'system-mds'),
    ('placer_operation', 'Placer Operations', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO underground_exploration_type (
    underground_exploration_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('NEW', 'New', 'system-mds', 'system-mds'),
    ('RHB', 'Rehabilitation', 'system-mds', 'system-mds'),
    ('SUR', 'Surface', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO now_application_progress_status (
    application_progress_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES 
    ('REV', 'Technical Review', 10, 'system-mds', 'system-mds'),
    ('REF', 'Referral', 20, 'system-mds', 'system-mds'),
    ('CON', 'Consultation', 30, 'system-mds', 'system-mds'),
    ('PUB', 'Public Comment', 40, 'system-mds', 'system-mds'),
    ('DFT', 'Draft Permit', 50, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


INSERT INTO now_application_delay_type (
    delay_type_code,
    description,
    create_user,
    update_user
    )
VALUES 
    ('INF', 'Missing Information from Proponent', 'system-mds', 'system-mds'),
    ('SEC', 'Waiting for Security', 'system-mds', 'system-mds'),
    ('OAB', 'Other Authorization (Bundling)', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


INSERT INTO now_application_permit_type(
    now_application_permit_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('MY-ABP', 'Multi-Year, Area-Based Permit', 'system-mds', 'system-mds'),
    ('OYP', 'One-Year Permit', 'system-mds', 'system-mds'),
    ('MYP', 'Multi-Year Permit', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


INSERT INTO now_application_document_type
(now_application_document_type_code, description, active_ind, now_application_document_sub_type_code, create_user, update_user)
VALUES
    ('ANS', 'Annual Summary', true, null, 'system-mds', 'system-mds'),
    ('ACP', 'Archaeological Chance Find Procedure', true, null, 'system-mds', 'system-mds'),
    ('BLP', 'Blasting Procedure', true, null, 'system-mds', 'system-mds'),
    ('EMS', 'Explosives Magazine Storage and Use Permit Application', true, null, 'system-mds', 'system-mds'),
    ('LAL', 'Landowner Authorization Letter', true, null, 'system-mds', 'system-mds'),
    ('MRP', 'Mine Emergency Response Plan', true, null, 'system-mds', 'system-mds'),
    ('OTH', 'Other', true, 'GDO', 'system-mds', 'system-mds'),
    ('RFE', 'Record of First Nations Engagement', true, null, 'system-mds', 'system-mds'),
    ('TAL', 'Tenure Authorization Letter', true, null, 'system-mds', 'system-mds'),
    ('REV', 'Review', true, null, 'system-mds','system-mds'),
    ('PUB', 'Public Comment', true, null, 'system-mds','system-mds'),
    ('CAL', 'Acknowledgement Letter', true, 'GDO', 'system-mds', 'system-mds'),
    ('WDL', 'Withdrawl Letter', true, 'GDO', 'system-mds', 'system-mds'),
    ('RJL', 'Rejection Letter', true, 'GDO', 'system-mds', 'system-mds'),
    ('NPE', 'Permit Enclosed Letter', true, null, 'system-mds', 'system-mds'),
    ('PMT','Working Permit', true, null, 'system-mds','system-mds'),
    ('PMA','Working Permit for Amendment', true, null, 'system-mds','system-mds'),
    ('SRB', 'Scan of Reclamation Security Document', true, 'SDO', 'system-mds','system-mds'),
    ('NIA', 'No Interest Acknowledgement Form', true, 'SDO', 'system-mds','system-mds'),
    ('AKL', 'Acknowledgement of Security Letter', true, 'SDO', 'system-mds','system-mds'),
    ('SCD', 'Bond Calculator', true, 'SDO', 'system-mds', 'system-mds'),
    ('TMP', 'Title/Tenure Map', true, null, 'system-mds', 'system-mds'),
    ('MPW', 'Proposed and/or Permitted Mine Area Map', true, null, 'system-mds', 'system-mds'),
    ('LMA', 'Location Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('LTM', 'Land Title/Licence of Ocupation Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('OMA', 'Overview Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('SMA', 'Supplemental Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('SSF', 'Submitted Shape Files', true, NULL, 'system-mds', 'system-mds'),
    ('CSL', 'Cross-sectional/Longitudinal', true, NULL, 'system-mds', 'system-mds'),
    ('PFR', 'Preliminary Field Reconnaisance', true, NULL, 'system-mds', 'system-mds'),
    ('AOA', 'Archaeological Overview Assessment', true, NULL, 'system-mds', 'system-mds'),
    ('AIA', 'Archaeological Impact Assessment', true, NULL, 'system-mds', 'system-mds'),
    ('SOP', 'Standard/Safe Operating Procedures', true, NULL, 'system-mds', 'system-mds'),
    ('RSP', 'Riparian Setbacks Plan', true, NULL, 'system-mds', 'system-mds'),
    ('WMP', 'Water Management Plan', true, NULL, 'system-mds', 'system-mds'),
    ('WPL', 'Wildlife Management Plan', true, NULL, 'system-mds', 'system-mds'),
    ('RPL', 'Reclamation Plan', true, NULL, 'system-mds', 'system-mds'),
    ('OMP', 'Other Management Plan', true, NULL, 'system-mds', 'system-mds'),
    ('SEP', 'Sediment and Erosion Control Plan', true, NULL, 'system-mds', 'system-mds'),
    ('FDP', 'Fugitive Dust Management Plan', true, NULL, 'system-mds', 'system-mds'),
    ('VMP', 'Vegetation Management Plan', true, NULL, 'system-mds', 'system-mds'),
    ('TSS', 'Terrain Stability Study', true, NULL, 'system-mds', 'system-mds'),
    ('MAD', 'Metal Leaching/Acid Rock Drainage', true, NULL, 'system-mds', 'system-mds'),
    ('LNO', 'Landowner Notification', true, NULL, 'system-mds', 'system-mds'),
    ('DWP', 'Description of Work/Work Program', true, NULL, 'system-mds', 'system-mds'),
    ('ARE', 'Agent Letter of Representation', true, NULL, 'system-mds', 'system-mds'),
    ('SRE', 'Status Report', true, 'GDO', 'system-mds', 'system-mds'),
    ('SOM', 'Status Report - Overlapping Interests Maps', true, 'GDO', 'system-mds', 'system-mds'),
    ('SRS', 'Status Report - Shape Files', true, 'GDO', 'system-mds', 'system-mds'),
    ('ECC', 'Email Correspondence/Communications', true, NULL, 'system-mds', 'system-mds'),
    ('RMI', 'Requst for More Information', true, NULL, 'system-mds', 'system-mds'),
    ('WFI', '30 day Warning for Information', true, 'GDO', 'system-mds', 'system-mds'),
    ('NPR', 'No Permit Required', true, NULL, 'system-mds', 'system-mds'),
    ('NPI', 'No Permit Required IP', true, NULL, 'system-mds', 'system-mds'),
    ('WFS', '30 day Warning for Security', true, 'SDO', 'system-mds', 'system-mds'),
    ('PEL', 'Permit Enclosed Letter', true, NULL, 'system-mds', 'system-mds'),
    ('RFD', 'Reasons for Decision', true, NULL, 'system-mds', 'system-mds'),
    ('CRS', 'Consultation Report/Summary', true, 'CDO', 'system-mds', 'system-mds'),
    ('BCR', 'Begin Consultation Request', true, 'CDO', 'system-mds', 'system-mds'),
    ('CCC', 'Consultation Correspondence (not in CRTS)', true, 'CDO', 'system-mds', 'system-mds'),
    ('CSD', 'Consultation Support for Decision', true, 'CDO', 'system-mds', 'system-mds'),
    ('BRR', 'Begin Referral Request', true, 'RDO', 'system-mds', 'system-mds'),
    ('RSR', 'Referral Summary Roll Up', true, 'RDO', 'system-mds', 'system-mds'),
    ('RLE', 'Referral Letter (outside of E-Referral)', true, 'RDO', 'system-mds', 'system-mds'),
    ('RRE', 'Referral Response (outside of E-Referral)', true, 'RDO', 'system-mds', 'system-mds'),
    ('PCA', 'Advertisement', true, 'PDO', 'system-mds', 'system-mds'),
    ('PCC', 'Public Comment', true, 'PDO', 'system-mds', 'system-mds'),
    ('PCM', 'Ministry Response', true, 'PDO', 'system-mds', 'system-mds')
on conflict do nothing;

INSERT INTO now_application_review_type(
    now_application_review_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('REF', 'Referral', 'system-mds', 'system-mds'),
    ('FNC', 'First Nations Consultation', 'system-mds', 'system-mds'),
    ('PUB', 'Public Comment', 'system-mds', 'system-mds'),
    ('ADV', 'Advertisements', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


-- Mine Report Definitions have been managed by sequential migrations. 
-- V2019.07.05.15.01
-- V2019.07.09.16.01
-- V2019.09.28.14.16

INSERT INTO document_template
(document_template_code, form_spec_json, template_file_path, active_ind, create_user, update_user)
VALUES
  ('NRL', '' , 'templates/now/Rejection Letter.docx', true, 'system-mds', 'system-mds'),
  ('NWL', '' , 'templates/now/Withdrawal Letter.docx', true, 'system-mds', 'system-mds'),
  ('NCL', '', 'templates/now/Acknowledgment Letter.docx', true, 'system-mds', 'system-mds'),
  ('NPE', '', 'templates/now/Permit Enclosed Letter.docx', true, 'system-mds', 'system-mds'),
  ('NTR', '[]', 'templates/now/Technical Review.docx', true, 'system-mds', 'system-mds'),
  ('PMT', '', 'templates/permit/Permit.docx', true, 'system-mds', 'system-mds'),
  ('PMA', '', 'templates/permit/Permit.docx', true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

UPDATE document_template SET form_spec_json = '[
    {
      "id": "letter_dt",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "context-value": "{DATETIME.UTCNOW}",
      "required": true
    },
    {
      "id": "mine_no",
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s name",
      "relative-data-path": "now_application.permittee.name",
      "required": true
    },
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "AUTO_SIZE_FIELD",
      "placeholder": "Enter the proponent''s address",
      "relative-data-path": "now_application.permittee.first_address.full",
      "required": true
    },
    {
      "id": "property",
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "application_dt",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "required": true,
      "relative-data-path": "now_application.submitted_date"
    },
    {
      "id": "issuing_inspector_name",
      "relative-data-path": "now_application.issuing_inspector.name",
      "read-only": true
    },
    {
      "id": "issuing_inspector_email",
      "relative-data-path": "now_application.issuing_inspector.email",
      "read-only": true
    },
    {
      "id": "issuing_inspector_phone",
      "relative-data-path": "now_application.issuing_inspector.phone",
      "read-only": true
    },
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Future proposals for mining activities on the above noted property will require the submission of a new Notice of Work application. Should you require further information or have questions please do not hesitate to contact me.",
      "required": true
    },
    {
      "id": "rc_office_email",
      "relative-data-path": "mine.region.regional_contact_office.email",
      "read-only": true
    },
    {
      "id": "rc_office_phone_number",
      "relative-data-path": "mine.region.regional_contact_office.phone_number",
      "read-only": true
    },
    {
      "id": "rc_office_fax_number",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.fax_number",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_1",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_1",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_2",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_2",
      "read-only": true
    }
  ]' 
where document_template_code = 'NRL';

UPDATE document_template SET form_spec_json = '[
    {
      "id": "letter_dt",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "context-value": "{DATETIME.UTCNOW}",
      "required": true
    },
    {
      "id": "mine_no",
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s name",
      "relative-data-path": "now_application.permittee.name",
      "required": true
    },
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "AUTO_SIZE_FIELD",
      "placeholder": "Enter the proponent''s address",
      "relative-data-path": "now_application.permittee.first_address.full",
      "required": true
    },
    {
      "id": "property",
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "withdrawal_dt",
      "label": "Withdrawal Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "context-value": "{DATETIME.UTCNOW}",
      "required": true
    },
    {
      "id": "issuing_inspector_name",
      "relative-data-path": "now_application.issuing_inspector.name",
      "read-only": true
    },
    {
      "id": "issuing_inspector_email",
      "relative-data-path": "now_application.issuing_inspector.email",
      "read-only": true
    },
    {
      "id": "issuing_inspector_phone",
      "relative-data-path": "now_application.issuing_inspector.phone",
      "read-only": true
    },
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "You will have to reapply should you wish to carry out your intended work program. You are reminded that pursuant to Section 10 of the Mines Act no exploration activities can be carried out unless you have received the required permit.",
      "required": true
    },
    {
      "id": "rc_office_email",
      "relative-data-path": "mine.region.regional_contact_office.email",
      "read-only": true
    },
    {
      "id": "rc_office_phone_number",
      "relative-data-path": "mine.region.regional_contact_office.phone_number",
      "read-only": true
    },
    {
      "id": "rc_office_fax_number",
      "relative-data-path": "mine.region.regional_contact_office.fax_number",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_1",
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_1",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_2",
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_2",
      "read-only": true
    }
  ]'
where document_template_code = 'NWL';

UPDATE document_template SET form_spec_json = '[
    {
      "id": "letter_dt",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "context-value": "{DATETIME.UTCNOW}",
      "required": true
    },
    {
      "id": "mine_no",
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s name",
      "relative-data-path": "now_application.permittee.name",
      "required": true
    },    
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "AUTO_SIZE_FIELD",
      "placeholder": "Enter the proponent''s address",
      "relative-data-path": "now_application.permittee.first_address.full",
      "required": true
    },
    {
      "id": "emailed_to",
      "label": "Emailed to",
      "type": "FIELD",
      "placeholder": "Enter the name of the email recipient",
      "relative-data-path": "now_application.permittee.email"
    },
    {
      "id": "property",
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "application_dt",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "required": true,
      "relative-data-path": "now_application.submitted_date"
    },
    {
      "id": "exploration_type",
      "label": "Exploration Type",
      "type": "FIELD",
      "placeholder": "Enter the exploration type",
      "required": true
    },
    {
      "id": "bond_inc_amt",
      "label": "Bond Increase Amount",
      "type": "CURRENCY",
      "placeholder": "Enter the bond increase amount",
      "relative-data-path": "now_application.security_adjustment"
    },
    {
      "id": "issuing_inspector_name",
      "relative-data-path": "now_application.issuing_inspector.name",
      "read-only": true
    },
    {
      "id": "issuing_inspector_email",
      "relative-data-path": "now_application.issuing_inspector.email",
      "read-only": true
    },
    {
      "id": "issuing_inspector_phone",
      "relative-data-path": "now_application.issuing_inspector.phone",
      "read-only": true
    },
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Other legislation may be applicable to the operation and you (the Permittee) may be required to obtain approvals or permits under that legislation. It is your responsibility to comply with the terms and conditions of all other permits and authorizations which you may have been issued and other applicable legislation including, but not limited to the: Wildlife Act, Wildfire Act, Wildfire Regulation and the Water Sustainability Act.",
      "required": true
    },
    {
      "id": "rc_office_email",
      "relative-data-path": "mine.region.regional_contact_office.email",
      "read-only": true
    },
    {
      "id": "rc_office_phone_number",
      "relative-data-path": "mine.region.regional_contact_office.phone_number",
      "read-only": true
    },
    {
      "id": "rc_office_fax_number",
      "relative-data-path": "mine.region.regional_contact_office.fax_number",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_1",
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_1",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_2",
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_2",
      "read-only": true
    }
  ]'
where document_template_code = 'NCL';

UPDATE document_template SET form_spec_json = '[
    {
      "id": "letter_dt",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "context-value": "{DATETIME.UTCNOW}",
      "required": true
    },
    {
      "id": "mine_no",
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s name",
      "relative-data-path": "now_application.permittee.name",
      "required": true
    },    
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "AUTO_SIZE_FIELD",
      "placeholder": "Enter the proponent''s address",
      "relative-data-path": "now_application.permittee.first_address.full",
      "required": true
    },
    {
      "id": "property",
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "application_dt",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "required": true,
      "relative-data-path": "now_application.submitted_date"
    },
    {
      "id": "issuing_inspector_name",
      "relative-data-path": "now_application.issuing_inspector.name",
      "read-only": true
    },
    {
      "id": "issuing_inspector_email",
      "relative-data-path": "now_application.issuing_inspector.email",
      "read-only": true
    },
    {
      "id": "issuing_inspector_phone",
      "relative-data-path": "now_application.issuing_inspector.phone",
      "read-only": true
    },
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Please ensure that you and all persons who are carrying out activities in accordance with this permit comply with all terms and conditions of the permit and are familiar with the permitted work program.\n\nThis permit applies only to the requirements under the Mines Act and Health, Safety and Reclamation Code for Mines in British Columbia (Code).  Other legislation may be applicable to the operation and you (the Permittee) may be required to obtain approvals or permits under that legislation. Examples of other authorizations would be for timber removal, water use, works within the agricultural land reserve etc.\n\nThe amount of your security deposit may be adjusted on the basis of reclamation performance, field inspections by this ministry, and on reports which may be requested.",
      "required": true
    },
    {
      "id": "rc_office_email",
      "relative-data-path": "mine.region.regional_contact_office.email",
      "read-only": true
    },
    {
      "id": "rc_office_phone_number",
      "relative-data-path": "mine.region.regional_contact_office.phone_number",
      "read-only": true
    },
    {
      "id": "rc_office_fax_number",
      "relative-data-path": "mine.region.regional_contact_office.fax_number",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_1",
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_1",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_2",
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_2",
      "read-only": true
    }
  ]'
where document_template_code = 'NPE';

UPDATE document_template SET form_spec_json = '[
    {
      "id": "mine_no",
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "permittee",
      "relative-data-path": "now_application.permittee.name",
      "read-only": true
    },
    {
      "id": "property",
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "issuing_inspector_name",
      "relative-data-path": "now_application.issuing_inspector.name",
      "read-only": true
    },
    {
      "id": "application_date",
      "relative-data-path": "now_application.submitted_date",
      "read-only": true
    },
    {
      "id": "application_type",
      "relative-data-path": "now_application.notice_of_work_type.description",
      "read-only": true
    }
  ]'
where document_template_code = 'PMT';

UPDATE document_template SET form_spec_json = '[
    {
      "id": "mine_no",
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "permittee",
      "relative-data-path": "now_application.permittee.name",
      "read-only": true
    },
    {
      "id": "property",
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "issuing_inspector_name",
      "relative-data-path": "now_application.issuing_inspector.name",
      "read-only": true
    },
    {
      "id": "application_date",
      "relative-data-path": "now_application.submitted_date",
      "read-only": true
    },
    {
      "id": "application_type",
      "relative-data-path": "now_application.notice_of_work_type.description",
      "read-only": true
    }
  ]'
where document_template_code = 'PMA';

UPDATE now_application_document_type
SET document_template_code = 'NCL'
where now_application_document_type_code = 'CAL';

UPDATE now_application_document_type
SET document_template_code = 'NWL'
where now_application_document_type_code = 'WDL';

UPDATE now_application_document_type
SET document_template_code = 'NRL'
where now_application_document_type_code = 'RJL';

UPDATE now_application_document_type
SET document_template_code = 'NPE'
where now_application_document_type_code = 'NPE';

UPDATE now_application_document_type
SET document_template_code = 'PMT'
where now_application_document_type_code = 'PMT';

UPDATE now_application_document_type
SET document_template_code = 'PMA'
where now_application_document_type_code = 'PMA';

INSERT INTO bond_status(
    bond_status_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('REL', 'Released', 'system-mds', 'system-mds'),
    ('CON', 'Confiscated', 'system-mds', 'system-mds'),
    ('ACT', 'Active', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO bond_type(
    bond_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('CAS', 'Cash', 'system-mds', 'system-mds'),
    ('ILC', 'Letter of Credit', 'system-mds', 'system-mds'),
    ('SBO', 'Surety Bond', 'system-mds', 'system-mds'),
    ('SAG', 'Safekeeping Agreement', 'system-mds', 'system-mds'),
    ('QET', 'Qualified Environmental Trust', 'system-mds', 'system-mds'),
    ('STR', 'Section 12 Reclamation', 'system-mds', 'system-mds'),
    ('ASA', 'Asset Security Agreement', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO exemption_fee_status
    (
    exemption_fee_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('Y', 'Yes', 10, 'system-mds', 'system-mds'),
    ('F', 'Ministry of Forests', 20, 'system-mds', 'system-mds'),
    ('H', 'Ministry of Highways', 30, 'system-mds', 'system-mds'),
    ('M', 'Municipality', 40, 'system-mds', 'system-mds'),
    ('O', 'OGC', 50, 'system-mds', 'system-mds'),
    ('P', 'Placer Surface', 60, 'system-mds', 'system-mds'),
    ('R', 'Reclaimed', 70, 'system-mds', 'system-mds'),
    ('X', 'Mineral Exploration Surface', 80, 'system-mds', 'system-mds'),
    ('A', 'Aboriginal', 90, 'system-mds', 'system-mds'),
    ('B', 'Abandoned', 100, 'system-mds', 'system-mds'),
    ('N', 'Not Permitted', 110, 'system-mds', 'system-mds'),
    ('I', 'Investigative Use S&G', 120, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO bond_document_type(
    bond_document_type_code,
    description,
    active_ind,
    create_user,
    update_user,
    display_order
    )
VALUES
    ('AKL', 'Acknowledgement of Security Letter', true, 'system-mds', 'system-mds', 10),
    ('BSR', 'Bond Status Request Letter', true, 'system-mds', 'system-mds', 20),
    ('CNC', 'Change of Name Certificate', true, 'system-mds', 'system-mds', 30),
    ('CSF', 'Confiscation of Security Form', true, 'system-mds', 'system-mds', 40),
    ('CSL', 'Confiscation of Security Letter', true, 'system-mds', 'system-mds', 50),   
    ('NIA', 'No Interest Payable Form', true, 'system-mds', 'system-mds', 60),
    ('RSF', 'Release of Security Form', true, 'system-mds', 'system-mds', 70),
    ('RSL', 'Release of Security Letter', true, 'system-mds', 'system-mds', 80),
    ('REL', 'Reminder Letter', false, 'system-mds', 'system-mds', 90),
    ('SRB', 'Scan of Reclamation Security Document', true, 'system-mds', 'system-mds', 100),
    ('SIB', 'Security Instructions for Bank', true, 'system-mds', 'system-mds', 110),
    ('PRL', 'Payment Reminder Letter', true, 'system-mds', 'system-mds', 120)
ON CONFLICT DO NOTHING;

INSERT INTO regional_contact_type
    (
    regional_contact_type_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('SHI', 'Senior Health, Safety and Environment Inspector', 30, 'system-mds', 'system-mds'),
    ('SPI', 'Senior Permitting Inspector', 40, 'system-mds', 'system-mds'),
    ('ROE', 'Regional Office', 20, 'system-mds', 'system-mds'),
    ('RDR', 'Regional Director', 10, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO regional_contact
    (
    regional_contact_type_code,
    mine_region_code,
    email,
    phone_number,
    fax_number,
    mailing_address_line_1,
    mailing_address_line_2
    )
VALUES
    ('ROE', 'NE', 'MMD-PrinceGeorge@gov.bc.ca', '250 565-4240', '250 565-4328', '350-1011 4th Avenue', 'Prince George, B.C. V2L 3H9'),
    ('ROE', 'NW', 'MMD-Smithers@gov.bc.ca', '250 847-7383', '250 847-7603', '2nd Floor, 3726 Alfred Avenue', 'Smithers, B.C. V0J 2N0'),
    ('ROE', 'SC', 'MMD-Kamloops@gov.bc.ca', '250 371-3912', NULL, '2nd Floor, 441 Columbia Street', 'Kamloops, B.C. V2C 2T3'),
    ('ROE', 'SE', 'MMD-Cranbrook@gov.bc.ca', '250 417-6134', NULL, '202-100 Cranbrook Street North', 'Cranbrook, B.C. V1C 3P9'),
    ('ROE', 'SW', 'SouthwestMinesDivision@gov.bc.ca', '778 698-3649', '250 953-3878', 'PO Box 9395, Stn Prov Govt', 'Victoria, B.C. V8W 9M9')
ON CONFLICT DO NOTHING;

INSERT INTO permit_condition_category
(condition_category_code, step, description, active_ind, display_order, create_user, update_user)
VALUES
	('GEC', 'A.', 'General Conditions', true, 10, 'system-mds', 'system-mds'),
	('HSC', 'B.', 'Health and Safety Conditions', true, 20, 'system-mds', 'system-mds'),
	('GOC', 'C.', 'Geotechnical Conditions', true, 30, 'system-mds', 'system-mds'),
	('ELC', 'D.', 'Environmental Land and Watercourses Conditions', true, 40, 'system-mds', 'system-mds'),
  ('RCC', 'E.', 'Reclamation and Closure Program Conditions', true, 50, 'system-mds', 'system-mds'),
	('ADC', 'F.', 'Additional Conditions', true, 60, 'system-mds', 'system-mds')
on conflict do nothing;

INSERT INTO permit_condition_type
(condition_type_code, description, active_ind, display_order, create_user, update_user)
VALUES
	('SEC', 'Permit Section', true, 10, 'system-mds', 'system-mds'),
	('CON', 'Condition', true, 20, 'system-mds', 'system-mds'),
	('LIS', 'List Item', true, 30, 'system-mds', 'system-mds')
on conflict do nothing;


INSERT INTO standard_permit_conditions
(standard_permit_condition_id, notice_of_work_type, condition, condition_category_code, condition_type_code, display_order, create_user, update_user)
VALUES
-- SAG starts at 1
  -- GENERAL SECTIONS
	(1, 'SAG', 'Approval', 'GEC', 'SEC', 1, 'system-mds', 'system-mds'),
  (2, 'SAG', 'Documentation and Reporting', 'GEC', 'SEC', 2, 'system-mds', 'system-mds'),
  (3, 'SAG', 'Reports to be signed by a Qualified Professional:', 'GEC', 'SEC', 3, 'system-mds', 'system-mds'),

-- HEALTH AND SAFETY SECTIONS
  (4, 'SAG', 'Mine Emergency Response Plan (MERP)', 'HSC', 'SEC', 1, 'system-mds', 'system-mds'),
  (5, 'SAG', 'Fuels and Lubricant Handling, Transportation and Storage', 'HSC', 'SEC', 2, 'system-mds', 'system-mds'),

-- GEOTECHNICAL SECTIONS
  (6, 'SAG', 'Reporting', 'GOC', 'SEC', 1, 'system-mds', 'system-mds'),
  (7, 'SAG', 'Site Stability', 'GOC', 'SEC', 2, 'system-mds', 'system-mds'),
  (8, 'SAG', 'Design', 'GOC', 'SEC', 3, 'system-mds', 'system-mds'),
  (9, 'SAG', 'Monitoring', 'GOC', 'SEC', 4, 'system-mds', 'system-mds'),

-- PROTECTION OF LAND AND WATERCOURSES
  (10, 'SAG', 'Cultural Heritage Resources', 'ELC', 'SEC', 1, 'system-mds', 'system-mds'),
  (11, 'SAG', 'Environmental Protection', 'ELC', 'SEC', 2, 'system-mds', 'system-mds'),
  (12, 'SAG', 'Invasive Species', 'ELC', 'SEC', 3, 'system-mds', 'system-mds'),
  (13, 'SAG', 'Receiving Foreign Materials', 'ELC', 'SEC', 4, 'system-mds', 'system-mds'),
  (14, 'SAG', 'Condition of the Land', 'ELC', 'SEC', 8, 'system-mds', 'system-mds'),

-- RECLAMATION AND CLOSURE PROGRAM
  (15, 'SAG', 'Reclamation Security', 'RCC', 'SEC', 1, 'system-mds', 'system-mds'),
  (16, 'SAG', 'Obligation to Reclaim', 'RCC', 'SEC', 2, 'system-mds', 'system-mds'),
  (17, 'SAG', 'Reclamation', 'RCC', 'SEC', 3, 'system-mds', 'system-mds'),
  (18, 'SAG', 'Roads and Trails', 'RCC', 'SEC', 4, 'system-mds', 'system-mds')
on conflict do nothing;

-- seed SAG conditions/list-items/conditions
INSERT INTO standard_permit_conditions
(standard_permit_condition_id, notice_of_work_type, parent_standard_permit_condition_id, condition, condition_category_code, condition_type_code, display_order, create_user, update_user)
VALUES
-- GENERAL CONDITIONS/LIST-ITEMS/CONDITIONS
  (19, 'SAG', 1, 'This permit authorizes only the following mining activities as outlined in the Mine Plan and Reclamation Program. Mining activities conducted that are not listed below are considered to be undertaken without a permit as required by Mines Act 10(1): Write out activities and total disturbance as indicated in the Notice of Work application (that you approve of – you must specify activities that were applied for that you do not approve of if there are any) for example;', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
	(20, 'SAG', 19, 'Approved Activities:', 'GEC', 'LIS', 1, 'system-mds', 'system-mds'),         

  (21, 'SAG', 20, 'Work Related Structures: office, storage buildings, first aid etc. [xx.x ha]', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),         
  (22, 'SAG', 20, 'Mining Areas: # of areas, dimensions [xx.x ha]', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),         
  (23, 'SAG', 20, 'Stockpile Area(s): [xx.x ha]', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),         
  (24, 'SAG', 20, 'Processing Area/Infrastructure: description [xx.x ha]', 'GEC', 'CON', 4, 'system-mds', 'system-mds'),         
	(25, 'SAG', 20, 'Settling Pond(s): # of sites, dimensions [x.xx ha]', 'GEC', 'CON', 5, 'system-mds', 'system-mds'),         
	(26, 'SAG', 20, 'Test pits: # of sites, dimensions [xx.x ha]', 'GEC', 'CON', 6, 'system-mds', 'system-mds'),         
  (27, 'SAG', 20, 'Access Construction/Modification: description, dimensions, etc [xx.x ha]', 'GEC', 'CON', 7, 'system-mds', 'system-mds'),         
  (28, 'SAG', 20, 'Other: list description of any other authorized activities [xx.x ha]', 'GEC', 'CON', 8, 'system-mds', 'system-mds'),         
  (29, 'SAG', 20, 'For a total disturbance area of [x.xx ha]', 'GEC', 'CON', 9, 'system-mds', 'system-mds'),

  (30, 'SAG', 19, 'Activities not approved:', 'GEC', 'LIS', 2, 'system-mds', 'system-mds'),        
  (31, 'SAG', 30, 'Fording of watercourses is not authorized.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),         
  (32, 'SAG', 30, 'Washing of aggregates is not authorized.', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),   

  (33, 'SAG', 19, 'Activities must be conducted within the permit area illustrated by [Figure #] [Permit Area Map], and located as shown in [Figure X, Figure Y and Figure Z.]', 'GEC', 'LIS', 3, 'system-mds', 'system-mds'),            
  (34, 'SAG', 19, 'This permit approval is valid until [approval end date].', 'GEC', 'LIS', 4, 'system-mds', 'system-mds'), 
  (35, 'SAG', 19, 'Authorized activities are restricted to the period from [seasonal date interval] [unless xyz occurs]', 'GEC', 'LIS', 5, 'system-mds', 'system-mds'),  
  (36, 'SAG', 19, 'Authorized activities are restricted to the following schedule [daily operating hours, or operating hours listed by day of week].', 'GEC', 'LIS', 6, 'system-mds', 'system-mds'),  
  (37, 'SAG', 19, 'A Maximum [Annual] Produced Tonnage of <<annual_tonnes>>;', 'GEC', 'LIS', 7, 'system-mds', 'system-mds'),   

  (38, 'SAG', 2, 'This Permit and the associated approved Mine Plan and Reclamation Program must be kept at the mine and must be available to an Inspector upon request.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (39, 'SAG', 2, 'A completed Annual Summary of Work and Reclamation form must be submitted to [Regional Mines Office e-mail Inbox] prior to March 31 annually and must be accompanied by:', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),

  (40, 'SAG', 39, 'A detailed as-built map of the mine site.', 'GEC', 'LIS', 1, 'system-mds', 'system-mds'),
  (41, 'SAG', 39, 'Shapefiles of the as-built disturbances which include attribution data for the status of reclamation.', 'GEC', 'LIS', 2, 'system-mds', 'system-mds'),
  (42, 'SAG', 2, 'Seven days prior to commencement of crushing, screening, or washing operations, written notification must be provided.  The notification must include the start date and the anticipated end date of the operation and be submitted to [Regional Mines Office e-mail Inbox].', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),             
  
  (43, 'SAG', 3, 'Unless otherwise approved in writing by the Chief Permitting Officer, all reports required to be submitted under this permit must be signed by a Qualified Professional.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'), 


-- HEALTH AND SAFETY CONDITIONS/LIST-ITEMS/CONDITIONS
  (44, 'SAG', 4, 'The MERP must be maintained on the mine site and made available to an inspector upon request.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),
  (45, 'SAG', 5, 'Handling, transportation and storage of fuels and lubricants must conform to the requirements of the document:  BC Fuel Guidelines, 9th Edition, March 2020 (NorthWest Response Ltd), or most recent version thereof.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),

-- GEOTECHNICAL CONDITIONS/LIST-ITEMS/CONDITIONS
  (46, 'SAG', 6, 'The Chief Inspector must be advised in writing upon discovery of any unforeseen conditions that could adversely affect the extraction of materials, site stability, erosion control or the reclamation of the site.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  (47, 'SAG', 6, 'An Advice of Geotechnical Incident form must be submitted to the Chief Inspector for any geotechnical incident that:', 'GOC', 'CON', 2, 'system-mds', 'system-mds'),

  (48, 'SAG', 47, 'is classified as a dangerous occurrence,', 'GOC', 'LIS', 1, 'system-mds', 'system-mds'),
  (49, 'SAG', 47, 'requires changes to an existing standard operating procedure or the creation of a site-specific safe work plan,', 'GOC', 'LIS', 2, 'system-mds', 'system-mds'),
  (50, 'SAG', 47, 'is considered a multi-bench pit slope failure,', 'GOC', 'LIS', 3, 'system-mds', 'system-mds'),
  (51, 'SAG', 47, 'is considered a spoil failure resulting in full loss of the crest berm, or', 'GOC', 'LIS', 4, 'system-mds', 'system-mds'),
  (52, 'SAG', 47, 'is considered a sign of dam instability (regardless of size).', 'GOC', 'LIS', 5, 'system-mds', 'system-mds'),

  (53, 'SAG', 7, 'Stockpiles of waste, overburden or soil must not be placed in areas identified as Terrain Class IV or V.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  
  (54, 'SAG', 8, 'Berms must be constructed at the toe of all waste dumps where rock rollout could present a safety hazard.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  (55, 'SAG', 8, 'All access roads, drill sites, equipment laydowns, trenches, and locations where cuts and/or fills exceed 6.0 meters on terrain Class IV or V must be constructed maintained and operated per the written recommendations of a qualified professional. The signed and sealed design reports must be maintained on site and made available an inspector upon request.', 'GOC', 'CON', 2, 'system-mds', 'system-mds'),
  (56, 'SAG', 8, 'The Chief Inspector requires that Sections 10.1.4 through 10.1.17 of the Code apply to this Mine.', 'GOC', 'CON', 3, 'system-mds', 'system-mds'),

  (57, 'SAG', 9, '[At least 90 days] prior to starting any work under this Permit, a geotechnical monitoring plan must be developed, implemented in doing any work under this permit, maintained on site and made available an inspector upon request. The geotechnical monitoring plan must be established to detect early evidence of any potentially dangerous slope instability during operation.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  (58, 'SAG', 57, 'The monitoring plan must include the instrument type, spacing, monitoring frequency, and appropriate initial threshold and response criteria for any required instrumentation.  The plan must be updated as needed to reflect the status of stockpile and waste dump development.', 'GOC', 'LIS', 1, 'system-mds', 'system-mds'),

-- PROTECTION OF LAND AND WATERCOURSES CONDITIONS/LIST-ITEMS/CONDITIONS
  (59, 'SAG', 10, 'The Archaeological Chance Find Procedure (‘CFP’) (Document 1.4 – update as required) must be implemented prior to commencement of work.  All employees and contractors at the mine site must be trained on the CFP.  The plan must be maintained onsite and available to an Inspector upon request.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (60, 'SAG', 10, 'In addition to (Document 1.4 – update as required), [First Nation’s Name]’s CFP must be implemented prior to commencement of work. All employees and contractors at the mine site must be trained on the [First Nation’s Name]’s CFP.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (61, 'SAG', 10, 'Prior to any ground disturbance, evaluation for archaeological potential in the area of work must be conducted by a qualified professional. Any recommendations resulting from this evaluation, provided by a qualified professional, must be implemented.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (62, 'SAG', 10, 'Prior to any ground disturbance, an Archaeological Overview Assessment (AOA) covering the planned work area(s) must be conducted. Preliminary Field Reconnaissance (PFR) must be conducted by a qualified person in areas of moderate to high archaeological potential that overlap planned disturbances.  Any recommendations resulting from this evaluation, provided by a qualified professional, must be implemented. <<OR>> Prior to any ground disturbance, an Archaeological Overview Assessment (AOA) covering the planned work area(s) must be conducted. An Archaeological Impact Assessment (AIA) must be completed in areas of high archaeological potential that overlap planned disturbances. Any recommendations resulting from this evaluation, provided by a qualified professional, must be implemented.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),

  (63, 'SAG', 11, 'Garbage and other attractants must be removed from work sites daily and must either be incinerated or stored in an airtight container until removed from the mine site.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (64, 'SAG', 11, 'Water intakes must comply with the Freshwater Intake End-of-Pipe Fish Screen Guideline, 1995 (Department of Fisheries and Oceans), or most recent version thereof.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (65, 'SAG', 11, 'Erosion and sediment must be effectively controlled on the mine site. Sediment laden water must be suitably contained on the mine site and not be allowed access to any watercourse.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (66, 'SAG', 11, 'Water which flows from disturbed areas must be collected and diverted into settling ponds, unless water is effectively exfiltrating through gravels.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (67, 'SAG', 11, 'No excavation is to be made within 1.5 meters of the groundwater table.', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),
  (68, 'SAG', 11, 'Settling ponds must be maintained regularly, with maintenance to include [xxx activities].', 'ELC', 'CON', 6, 'system-mds', 'system-mds'),
  (69, 'SAG', 11, 'A schedule and procedure for sediment removal from settling ponds must be implemented to ensure adequate settling of suspended solids. The information must be maintained on site and be available to an Inspector upon request.', 'ELC', 'CON', 7, 'system-mds', 'system-mds'),
  (70, 'SAG', 11, 'Sediment removed from settling ponds must be contained and stockpiled for reclamation.', 'ELC', 'CON', 8, 'system-mds', 'system-mds'),
  (71, 'SAG', 11, 'Dust originating from the mine site must be controlled at the source.', 'ELC', 'CON', 9, 'system-mds', 'system-mds'),
  (72, 'SAG', 11, '[Plan Name, Date (Author of Plan)] must be implemented on site.', 'ELC', 'CON', 10, 'system-mds', 'system-mds'),
  (73, 'SAG', 11, 'Daily monitoring of the functionality of settling ponds must be performed by the mine manager, and observations must be recorded in a written log. The written log must be made available to an Inspector upon request.', 'ELC', 'CON', 11, 'system-mds', 'system-mds'),
  (74, 'SAG', 11, 'Authorized activities are restricted to the period from [July 16th – October 31st], unless a [mountain goat/caribou/mountain sheep/moose/grizzly bear/wildlife management plan] an is developed and submitted to [Regional Mines Office e-mail Inbox] for the approval of the Chief Permitting Officer. The [Plan Name] must be implemented upon commencement of work.', 'ELC', 'CON', 12, 'system-mds', 'system-mds'),
  (75, 'SAG', 11, 'Any significant releases of sediment-laden water, defined as an unauthorized discharge to the receiving environment, must be appropriately characterized with respect to extent and loading, and reported to the Chief Inspector at [Regional Mines Office e-mail Inbox] within [28days] of discovery.', 'ELC', 'CON', 13, 'system-mds', 'system-mds'),

  (76, 'SAG', 75, 'Characterization of unauthorized discharges of sediment-laden run-off must include, at a minimum, flow, total suspended solids, turbidity, pH, conductivity, temperature, dissolved oxygen, and total and dissolved metals, of both the effluent and the receiving water.', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),

  (77, 'SAG', 12, 'Invasive plants on the site must be identified, monitored, controlled and documented. Monitoring and treatment records must be made available to an Inspector upon request.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (78, 'SAG', 12, 'Reasonable efforts must be taken to ensure that weeds do not migrate from the site to adjacent areas.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (79, 'SAG', 12, 'The control of invasive plants must consider using non-toxic means for weed control.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (80, 'SAG', 12, 'The Permittee must ensure that all seed used on-site is certified weed free.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (81, 'SAG', 12, '[At least 90 days] prior to the commencement of work under this Permit, an Invasive Species Management Plan must be developed to the satisfaction of the Chief Permitting Officer and the plan must be implemented in doing any work under this Permit.', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),
  (82, 'SAG', 12, '[Name of Plan, Date (Author of Plan)] must be implemented on site.', 'ELC', 'CON', 6, 'system-mds', 'system-mds'),


  (83, 'SAG', 13, 'The receipt, storage, treatment/processing and or use of imported materials including but not limited to garbage, refuse, concrete, asphalt, asphalt shingles, biosolids and soils originating from off site is not permitted unless authorized in writing by an Inspector.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (84, 'SAG', 14, 'All equipment brought on to the site must be removed from the project area when the site is not active.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (85, 'SAG', 14, 'Derelict or damaged equipment, supplies, or materials must not be stored or otherwise left or abandoned anywhere on the mine site.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (86, 'SAG', 14, 'When the site is not active, disturbed areas are to be left in a condition that is neat, clean and safe.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),

-- RECLAMATION AND CLOSURE PROGRAM CONDITIONS/LIST-ITEMS/CONDITIONS
  (87, 'SAG', 15, '[X dollars] $<<bond_amt>> in security must be maintained with the Minister of Finance.', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (88, 'SAG', 87, 'The security must be deposited in accordance with the following installment schedule:', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (89, 'SAG', 88, 'Prior to the mobilization of heavy equipment to the site for the purposes of construction of [description of activity]: [$Dollar amount] for a subtotal of [$Dollar Amount]; and', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (90, 'SAG', 88, 'Within [Enter time] months following the start of construction of [description of activity]: [$Dollar Amount] for a total of [$Dollar Amount].', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),

  (91, 'SAG', 16, 'Reclamation of the surface of the land affected by the operations must be conducted in accordance with the approved work program. The surface of the land and watercourses must be reclaimed to the following end land use:  <<land_use>>;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (92, 'SAG', 17, 'All available topsoil, overburden, and organic material including large woody debris in the disturbance footprint must be salvaged and stockpiled for use in reclamation.', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (93, 'SAG', 17, 'All stockpiled topsoil, overburden, and organic material including large woody debris must be protected from erosion, degradation, and contamination.', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (94, 'SAG', 17, 'All stockpiles must be clearly marked to ensure that they are protected during construction and mine operations.', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),
  (95, 'SAG', 17, 'Stripped and stockpiled soil suitable for use in reclamation must not be used as fill.', 'RCC', 'CON', 4, 'system-mds', 'system-mds'),
  (96, 'SAG', 17, 'Topsoil must not be removed from the mine site unless authorized in writing by an Inspector.', 'RCC', 'CON', 5, 'system-mds', 'system-mds'),
  (97, 'SAG', 17, 'Progressive reclamation must be conducted whenever practicable. Reclamation activities must include:', 'RCC', 'CON', 6, 'system-mds', 'system-mds'),
  (98, 'SAG', 97, 'Compacted surfaces must be de-compacted to allow water infiltration and achieve self-staining vegetation.', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (99, 'SAG', 97, 'Salvaged soil material must:', 'RCC', 'LIS', 2, 'system-mds', 'system-mds'),
  (100, 'SAG', 97, 'be replaced on disturbed areas to pre-disturbance depth;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (101, 'SAG', 97, 'be treated with a rough and loose site preparation where practicable;', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (102, 'SAG', 97, 'be keyed into the underlying materials such that they do not slump off or become unstable;', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),
  (103, 'SAG', 97, 'incorporate roots, stumps and other woody debris to reduce erosion and create greater biological diversity; and', 'RCC', 'CON', 4, 'system-mds', 'system-mds'),
  (104, 'SAG', 97, 'be re-vegetated promptly to a self-sustaining state using appropriate and/or native plant species that support approved end land use.', 'RCC', 'CON', 5, 'system-mds', 'system-mds'),

  (105, 'SAG', 18, 'Individual roads and trails will be exempted from the requirement for total reclamation if either:', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (105, 'SAG', 105, 'It can be demonstrated that an agency of the Crown has accepted responsibility in writing for the operation, maintenance and reclamation of the road or trail; or', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (105, 'SAG', 105, 'The Chief Permitting Officer provides notification that the road should not be reclaimed due to the use or potential use by other users who will assume liability.', 'RCC', 'LIS', 2, 'system-mds', 'system-mds')
on conflict do nothing;

-- UPDATE PLA SEED PARENTS
INSERT INTO standard_permit_conditions
(standard_permit_condition_id, notice_of_work_type, condition, condition_category_code, condition_type_code, display_order, create_user, update_user)
VALUES
-- PLA starts at 200
-- GENERAL SECTIONS
	(200, 'PLA', 'Approval', 'GEC', 'SEC', 1, 'system-mds', 'system-mds'),
  (201, 'PLA', 'Documentation and Reporting', 'GEC', 'SEC', 2, 'system-mds', 'system-mds'),
  (202, 'PLA', 'Reports to be signed by a Qualified Professional:', 'GEC', 'SEC', 3, 'system-mds', 'system-mds'),

-- HEALTH AND SAFETY SECTIONS
  (203, 'PLA', 'Mine Emergency Response Plan (MERP)', 'HSC', 'SEC', 1, 'system-mds', 'system-mds'),
  (204, 'PLA', 'Fuels and Lubricant Handling, Transportation and Storage', 'HSC', 'SEC', 2, 'system-mds', 'system-mds'),

-- GEOTECHNICAL SECTIONS
  (205, 'PLA', 'Reporting', 'GOC', 'SEC', 1, 'system-mds', 'system-mds'),
  (206, 'PLA', 'Site Stability', 'GOC', 'SEC', 2, 'system-mds', 'system-mds'),
  (207, 'PLA', 'Design', 'GOC', 'SEC', 3, 'system-mds', 'system-mds'),
  (208, 'PLA', 'Monitoring', 'GOC', 'SEC', 4, 'system-mds', 'system-mds'),

-- PROTECTION OF LAND AND WATERCOURSES
  (209, 'PLA', 'Cultural Heritage Resources', 'ELC', 'SEC', 1, 'system-mds', 'system-mds'),
  (210, 'PLA', 'Environmental Protection', 'ELC', 'SEC', 2, 'system-mds', 'system-mds'),
  (211, 'PLA', 'Invasive Species', 'ELC', 'SEC', 3, 'system-mds', 'system-mds'),
  (212, 'PLA', 'Receiving Foreign Materials', 'ELC', 'SEC', 4, 'system-mds', 'system-mds'),
  (213, 'PLA', 'Inter-seasonal Condition of the Land', 'ELC', 'SEC', 5, 'system-mds', 'system-mds'),

-- RECLAMATION AND CLOSURE PROGRAM
  (214, 'PLA', 'Reclamation Security', 'RCC', 'SEC', 1, 'system-mds', 'system-mds'),
  (215, 'PLA', 'Obligation to Reclaim', 'RCC', 'SEC', 2, 'system-mds', 'system-mds'),
  (216, 'PLA', 'Reclamation', 'RCC', 'SEC', 3, 'system-mds', 'system-mds'),
  (217, 'PLA', 'Roads and Trails', 'RCC', 'SEC', 4, 'system-mds', 'system-mds')
on conflict do nothing;


-- UPDATE PLA SEED 
INSERT INTO standard_permit_conditions
(standard_permit_condition_id, notice_of_work_type, parent_standard_permit_condition_id, condition, condition_category_code, condition_type_code, display_order, create_user, update_user)
VALUES
-- GENERAL CONDITIONS/LIST-ITEMS/CONDITIONS
  (218, 'PLA', 200, 'This permit authorizes only the following mining activities as outlined in the Mine Plan and Reclamation Program. Mining activities conducted that are not listed below are considered to be undertaken without a permit as required by Mines Act 10(1): Write out activities and total disturbance as indicated in the Notice of Work application (that you approve of – you must specify activities that were applied for that you do not approve of if there are any) for example;', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),

  (219, 'PLA', 218, 'Approved Activities:', 'GEC', 'LIS', 1, 'system-mds', 'system-mds'),  

  (220, 'PLA', 219, 'Diversion of Watercourses: (x.xx ha) OR not approved under this authorization.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),         
  (221, 'PLA', 219, 'Work Related Structures: office, dry tent, storage buildings, first aid etc. (xx.x ha)', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),         
  (222, 'PLA', 219, 'Mining Areas: # of areas, dimensions (xx.x ha)', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),         
  (223, 'PLA', 219, 'Processing infrastructure: description (xx.x ha)', 'GEC', 'CON', 4, 'system-mds', 'system-mds'),         
	(224, 'PLA', 219, 'Test pits: # of sites, dimensions (xx.x ha)', 'GEC', 'CON', 5, 'system-mds', 'system-mds'),         
	(225, 'PLA', 219, 'Access Construction/Modification: description, dimensions, etc (xx.x ha)', 'GEC', 'CON', 6, 'system-mds', 'system-mds'),         
  (226, 'PLA', 219, 'Other: list description of any other authorized activities (xx.x ha)', 'GEC', 'CON', 7, 'system-mds', 'system-mds'),         
  (227, 'PLA', 219, 'For a total disturbance area of (x.xx ha)', 'GEC', 'CON', 8, 'system-mds', 'system-mds'),       

  (228, 'PLA', 218, 'Activities not approved:', 'GEC', 'LIS', 2, 'system-mds', 'system-mds'),    

  (229, 'PLA', 228, 'Fording of watercourses is not authorized.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),   
  (230, 'PLA', 228, 'Suction Dredging and/or Enhanced Sniping are not authorized.; add others if necessary', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),   
  (231, 'PLA', 228, 'Individual settling ponds must not be constructed greater than 2.5 m above grade or be capable of impounding greater than 30,000m3 volume.', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),   

  (232, 'PLA', 218, 'Approved mining activities must be conducted within the permit area illustrated by [Figure #] [Permit Area Map], and located as shown in [Figure X, Figure Y and Figure Z.] [OR] Activities must be conducted within the permit area illustrated by [Figure # ][Permit Area Map]. [specific activity/ies)] must be constructed only in the location(s) shown in [Figure X, Figure Y and Figure Z].', 'GEC', 'LIS', 3, 'system-mds', 'system-mds'),    
  (233, 'PLA', 218, 'This permit approval is valid until <<approval end date>>.', 'GEC', 'LIS', 4, 'system-mds', 'system-mds'),  
  (234, 'PLA', 218, 'Maximum Annual Production of Pay Dirt <<annual_tonnes>>;', 'GEC', 'LIS', 5, 'system-mds', 'system-mds'),
  (235, 'PLA', 218, 'Authorized activities are restricted to the period from [seasonal date interval] [unless xyz occurs]', 'GEC', 'LIS', 6, 'system-mds', 'system-mds'),
  (236, 'PLA', 218, 'The use of all-terrain vehicles (ATVs) and utility task vehicles (UTVs) is [not authorized/restricted to business purposes/restricted to authorized exploration access].', 'GEC', 'LIS', 7, 'system-mds', 'system-mds'),
  (237, 'PLA', 218, 'The construction of new access is limited to spur roads of no more than [50m/100m/200m, etc.] in length from the existing access as shown on the attached mapping.  [Figure X, Figure Y and Figure Z]', 'GEC', 'LIS', 8, 'system-mds', 'system-mds'),


  (238, 'PLA', 201, 'This Permit and the associated approved Mine Plan and Reclamation Program must be kept at the mine and must be available to an Inspector upon request.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (239, 'PLA', 201, 'A completed Annual Summary of Placer Activities (ASPA) form must be submitted to [Regional Mines Office e-mail Inbox] prior to March 31 annually and must be accompanied by:', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),

  (240, 'PLA', 239, 'A detailed as-built map of the mine site.', 'GEC', 'LIS', 1, 'system-mds', 'system-mds'), 
  (241, 'PLA', 239, 'Shapefiles of the as-built disturbances which include attribution data for the status of reclamation.', 'GEC', 'LIS', 2, 'system-mds', 'system-mds'),  

  (242, 'PLA', 202, 'Unless otherwise approved in writing by the Chief Permitting Officer, all reports required to be submitted under this permit must be signed by a Qualified Professional.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),   

  -- HEALTH AND SAFETY CONDITIONS/LIST-ITEMS/CONDITIONS
  (243, 'PLA', 203, 'The MERP must be maintained on the mine site and made available to an inspector upon request.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),  
  (244, 'PLA', 204, 'Handling, transportation and storage of fuels and lubricants must conform to the requirements of the document:  BC Fuel Guidelines, 9th Edition, March 2020 (NorthWest Response Ltd), or most recent version thereof.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),  

  -- GEOTECHNICAL CONDITIONS/LIST-ITEMS/CONDITIONS
  (245, 'PLA', 205, 'The Chief Inspector must be advised in writing upon discovery of any unforeseen conditions that could adversely affect the extraction of materials, site stability, erosion control or the reclamation of the site.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),  
  
  (246, 'PLA', 205, 'An Advice of Geotechnical Incident form must be submitted to the Chief Inspector for any geotechnical incident that:', 'GOC', 'CON', 2, 'system-mds', 'system-mds'),  
  (247, 'PLA', 246, 'is classified as a dangerous occurrence,', 'GOC', 'LIS', 1, 'system-mds', 'system-mds'),  
  (248, 'PLA', 246, 'requires changes to an existing standard operating procedure or the creation of a site-specific safe work plan,', 'GOC', 'LIS', 2, 'system-mds', 'system-mds'),  
  (249, 'PLA', 246, 'is considered a multi-bench pit slope failure,', 'GOC', 'LIS', 3, 'system-mds', 'system-mds'),  
  (250, 'PLA', 246, 'is considered a spoil failure resulting in full loss of the crest berm, or', 'GOC', 'LIS', 4, 'system-mds', 'system-mds'),  
  (251, 'PLA', 246, 'is considered a sign of dam instability (regardless of size).', 'GOC', 'LIS', 5, 'system-mds', 'system-mds'), 

  (252, 'PLA', 206, 'Stockpiles of waste, overburden or soil must not be placed in areas identified as Terrain Class IV or V.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'), 
  (253, 'PLA', 207, 'Berms must be constructed at the toe of all waste dumps where rock rollout could present a safety hazard', 'GOC', 'CON', 1, 'system-mds', 'system-mds'), 
  (254, 'PLA', 207, 'Prior to initiating road or trail construction, a qualified person must determine the terrain stability classification for all areas where roads and trails are to be constructed.', 'GOC', 'CON', 2, 'system-mds', 'system-mds'),  
  (255, 'PLA', 207, 'All access roads, drill sites, equipment laydowns, and trenches or pits on terrain Class IV or V, must be constructed maintained and operated per the written recommendations of a qualified professional. The signed and sealed design reports must be maintained on site and made available an inspector upon request.', 'GOC', 'CON', 3, 'system-mds', 'system-mds'),  
  (256, 'PLA', 207, 'The Chief Inspector requires that Sections 10.1.4 through 10.1.17 of the Code apply to this Mine.', 'GOC', 'CON', 4, 'system-mds', 'system-mds'),   


  -- PROTECTION OF LAND AND WATERCOURSES CONDITIONS/LIST-ITEMS/CONDITIONS
  (257, 'PLA', 209, 'The Archaeological Chance Find Procedure (‘CFP’) (Document 1.4 – update as required) must be implemented prior to commencement of work.  All employees and contractors at the mine site must be trained on the CFP.  The plan must be maintained onsite and available to an Inspector upon request.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (258, 'PLA', 209, 'In addition to (Document 1.4 – update as required), [First Nation’s Name]’s CFP must be implemented prior to commencement of work. All employees and contractors at the mine site must be trained on the [First Nation’s Name]’s CFP.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (259, 'PLA', 209, 'Prior to any ground disturbance, evaluation for archaeological potential in the area of work must be conducted by a qualified professional. Any recommendations resulting from this evaluation, provided by a qualified professional, must be implemented.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (260, 'PLA', 209, 'Prior to any ground disturbance, an Archaeological Overview Assessment (AOA) covering the planned work area(s) must be conducted. Preliminary Field Reconnaissance (PFR) must be conducted by a qualified person in areas of moderate to high archaeological potential that overlap planned disturbances.  Any recommendations resulting from this evaluation, provided by a qualified professional, must be implemented. <<OR>> Prior to any ground disturbance, an Archaeological Overview Assessment (AOA) covering the planned work area(s) must be conducted. An Archaeological Impact Assessment (AIA) must be completed in areas of high archaeological potential that overlap planned disturbances.  Any recommendations resulting from this evaluation, provided by a qualified professional, must be implemented.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),


  (261, 'PLA', 210, '“Natural Boundary” means the visible high water mark of any lake, river, stream or other body of water where the presence and action of the water are so common and usual and so long continued as to mark upon the soils of the bed of the lake, river, stream or other body of water a character distinct from that of the banks, thereof, both in respect to vegetation, and in respect to the nature of the soil itself.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (262, 'PLA', 210, 'Garbage and other attractants must be removed from work sites daily and must either be incinerated or stored in an airtight container until removed from the mine site.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (263, 'PLA', 210, 'Water intakes must comply with the Freshwater Intake End-of-Pipe Fish Screen Guideline, 1995 (Department of Fisheries and Oceans), or most recent version thereof.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (264, 'PLA', 210, 'Chemicals or mercury must not be used to recover a mineral on the mine site.  Mercury must not be stored on the mine site.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (265, 'PLA', 210, 'Erosion and sediment must be effectively controlled on the mine site. Sediment laden water must be suitably contained on the mine site and not be allowed access to any watercourse.', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),
  (266, 'PLA', 210, 'All process or wash water must discharge to (a) settling pond(s).', 'ELC', 'CON', 6, 'system-mds', 'system-mds'),
  (267, 'PLA', 210, 'A minimum of 0.5 meters of freeboard must be maintained at all times in settling ponds.', 'ELC', 'CON', 7, 'system-mds', 'system-mds'),
  (268, 'PLA', 210, 'Process water or wash water in settling ponds must be re-circulated where possible and must exfiltrate to ground from within the settling pond.', 'ELC', 'CON', 8, 'system-mds', 'system-mds'),
  (269, 'PLA', 210, 'A riparian setback distance of ten (10) horizontal meters of the natural boundary of any watercourse on the worksite must be clearly marked.', 'ELC', 'CON', 9, 'system-mds', 'system-mds'),
  (270, 'PLA', 210, 'Forest cover and vegetation within ten (10) horizontal meters of the natural boundary of any watercourse must not be disturbed or removed.', 'ELC', 'CON', 10, 'system-mds', 'system-mds'),
  (271, 'PLA', 210, 'Mining activities must not occur within ten (10) horizontal meters of the natural boundary of any watercourse.', 'ELC', 'CON', 11, 'system-mds', 'system-mds'),
  (272, 'PLA', 210, 'Tailings and any part of any tailings pond or settling pond must not be located within ten (10) horizontal meters of the natural boundary of any watercourse. Where water infiltrates to ground, suspended solids must not be allowed entry into watercourses.', 'ELC', 'CON', 12, 'system-mds', 'system-mds'),
  (273, 'PLA', 210, 'Water which flows from disturbed areas must be collected and diverted into settling ponds, unless water is effectively exfiltrating', 'ELC', 'CON', 13, 'system-mds', 'system-mds'),
  (274, 'PLA', 210, 'Settling ponds must be maintained regularly, with maintenance to include [xxx activities].', 'ELC', 'CON', 14, 'system-mds', 'system-mds'),
  (275, 'PLA', 210, 'A schedule and procedure for sediment removal from settling ponds must be implemented to ensure adequate settling of suspended solids. The information must be maintained on site and be available to an Inspector upon request.', 'ELC', 'CON', 15, 'system-mds', 'system-mds'),
  (276, 'PLA', 210, 'Sediment removed from settling ponds must be contained and stockpiled for reclamation.', 'ELC', 'CON', 16, 'system-mds', 'system-mds'),
  (277, 'PLA', 210, 'Dust originating from the mine site must be controlled at the source.', 'ELC', 'CON', 17, 'system-mds', 'system-mds'),
  (278, 'PLA', 210, '[Plan Name, Date (Author of Plan)] must be implemented on site.', 'ELC', 'CON', 18, 'system-mds', 'system-mds'),
  (279, 'PLA', 210, 'Authorized activities are restricted to the period from [July 16th – October 31st], unless a [mountain goat/caribou/mountain sheep/moose/grizzly bear/wildlife management plan] an is developed and submitted to [Regional Mines Office e-mail Inbox] for the approval of the Chief Permitting Officer. The [Plan Name] must be implemented upon commencement of work.', 'ELC', 'CON', 19, 'system-mds', 'system-mds'),
  (280, 'PLA', 210, 'For any discharge of sediment laden water originating from the mine site, immediate measures must be taken to prevent further and future discharges.', 'ELC', 'CON', 20, 'system-mds', 'system-mds'),
  (281, 'PLA', 210, 'Any significant releases of sediment-laden water, defined as an unauthorized discharge to the receiving environment, must be appropriately characterized with respect to extent and loading, and reported to the Chief Inspector at <<Regional Mines Office e-mail Inbox>> within <<[28 days]>> of discovery.', 'ELC', 'CON', 21, 'system-mds', 'system-mds'),


  (282, 'PLA', 280, 'Discharge that reaches a surface water body must be documented with estimates on flow rate and photographs and reported to the Chief Inspector at [Regional Mines e-mail Inbox] within 24 hours of discovery. <<OR>> for production placer sites', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),
  (283, 'PLA', 281, 'Characterization of unauthorized discharges of sediment-laden run-off must include, at a minimum, flow, total suspended solids, turbidity, pH, conductivity, temperature, dissolved oxygen, and total and dissolved metals, of both the effluent and the receiving water.', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),


  (284, 'PLA', 211, 'Invasive plants on the site must be identified, monitored, controlled and documented. Monitoring and treatment records must be made available to an Inspector upon request.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (285, 'PLA', 211, 'Reasonable efforts must be taken to ensure that weeds do not migrate from the site to adjacent areas.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (286, 'PLA', 211, 'The control of invasive plants must consider using non-toxic means for weed control.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (287, 'PLA', 211, '[At least 90 days] prior to the commencement of work under this Permit, an Invasive Species Management Plan must be developed to the satisfaction of the Chief Permitting Officer and the plan must be implemented in doing any work under this Permit.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (288, 'PLA', 211, '[Name of Plan, Date (Author of Plan)] must be implemented on site.', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),


  (289, 'PLA', 212, 'The receipt, storage, treatment/processing and or use of imported materials including but not limited to garbage, refuse, concrete, asphalt, asphalt shingles, biosolids and soils originating from off site is not permitted unless authorized in writing by an Inspector.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),

  (290, 'PLA', 213, 'At the end of each field season, no more than [X#] ha of disturbed area is to be left un-reclaimed.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (291, 'PLA', 213, 'All equipment brought on to the site must be removed from the project area [by dd/mm of each year].', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (292, 'PLA', 213, 'Derelict or damaged equipment, supplies, or materials must not be stored or otherwise left or abandoned anywhere on property.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (293, 'PLA', 213, 'At the end of each field season, disturbed areas are to be left in a condition that is neat, clean and safe.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),


    -- RECLAMATION AND CLOSURE PROGRAM CONDITIONS/LIST-ITEMS/CONDITIONS
  (294, 'PLA', 214, 'X dollars ($<<bond_amt>>) in security must be maintained with the Minister of Finance.', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (295, 'PLA', 294, 'The security must be deposited in accordance with the following installment schedule:', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (296, 'PLA', 295, 'Prior to the mobilization of heavy equipment to the site for the purposes of construction of <<description of activity>>: <<$Dollar amount>> for a subtotal of <<$Dollar Amount>>; and', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (297, 'PLA', 295, 'Within {Enter time} months following the start of construction of <<description of activity>>: <<$Dollar Amount>> for a total of <<$Dollar Amount>>.', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),

  (298, 'PLA', 215, 'Reclamation of the surface of the land affected by the operations must be conducted in accordance with the approved Mine Plan and Reclamation Program. The surface of the land and watercourses must be reclaimed to the following end land use: <<land_use>>;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (299, 'PLA', 215, 'Reclamation obligations include [xxx disturbance(s)], but exclude [xxx disturbance(s)].', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),


  (300, 'PLA', 216, 'All available topsoil, overburden, and organic material including large woody debris in the disturbance footprint must be salvaged and stockpiled for use in reclamation.', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (301, 'PLA', 216, 'All stockpiled topsoil, overburden, and organic material including large woody debris must be protected from erosion, degradation, and contamination.', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (302, 'PLA', 216, 'All stockpiles must be clearly marked to ensure that they are protected during construction and mine operations.', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),
  (303, 'PLA', 216, 'Stripped and stockpiled soil suitable for use in reclamation must not be used as fill.', 'RCC', 'CON', 4, 'system-mds', 'system-mds'),
  (304, 'PLA', 216, 'Topsoil must not be removed from the mine site without the specific written permission of an Inspector.', 'RCC', 'CON', 5, 'system-mds', 'system-mds'),
  (305, 'PLA', 216, 'Progressive reclamation must be conducted whenever practicable. Reclamation activities must include:', 'RCC', 'CON', 6, 'system-mds', 'system-mds'),

  (306, 'PLA', 305, 'Compacted surfaces must be de-compacted to allow water infiltration and achieve self-staining vegetation.', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (307, 'PLA', 305, 'Salvaged soil material must:', 'RCC', 'LIS', 2, 'system-mds', 'system-mds'),

  (308, 'PLA', 307, 'be replaced on disturbed areas to pre-disturbance depth;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (309, 'PLA', 307, 'be treated with a rough and loose site preparation where practicable;', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (310, 'PLA', 307, 'be keyed into the underlying materials such that they do not slump off or become unstable;', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),
  (311, 'PLA', 307, 'incorporate roots, stumps and other woody debris to reduce erosion and create greater biological diversity; and', 'RCC', 'CON', 4, 'system-mds', 'system-mds'),
  (312, 'PLA', 307, 'be re-vegetated promptly to a self-sustaining state using appropriate and/or native plant species that support approved end land use.', 'RCC', 'CON', 5, 'system-mds', 'system-mds'),



  (313, 'PLA', 217, 'Individual roads and trails will be exempted from the requirement for total reclamation if either:', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (314, 'PLA', 313, 'It can be demonstrated that an agency of the Crown has accepted responsibility in writing for the operation, maintenance and reclamation of the road or trail; or', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (315, 'PLA', 313, 'The Chief Permitting Officer provides notification that the road should not be reclaimed due to the use or potential use by other users who will assume liability.', 'RCC', 'LIS', 2, 'system-mds', 'system-mds')
on conflict do nothing;


-- UPDATE MINERAL AND COAL SEED PARENTS
INSERT INTO standard_permit_conditions
(standard_permit_condition_id, notice_of_work_type, condition, condition_category_code, condition_type_code, display_order, create_user, update_user)
VALUES
-- MIN starts at 400
-- GENERAL SECTIONS
	(400, 'MIN', 'Approval', 'GEC', 'SEC', 1, 'system-mds', 'system-mds'),
  (401, 'MIN', 'Documentation and Reporting', 'GEC', 'SEC', 2, 'system-mds', 'system-mds'),
  (402, 'MIN', 'Reports to be signed by a Qualified Professional:', 'GEC', 'SEC', 3, 'system-mds', 'system-mds'),

-- HEALTH AND SAFETY SECTIONS
  (403, 'MIN', 'Mine Emergency Response Plan (MERP)', 'HSC', 'SEC', 1, 'system-mds', 'system-mds'),
  (404, 'MIN', 'Fuels and Lubricant Handling, Transportation and Storage', 'HSC', 'SEC', 2, 'system-mds', 'system-mds'),
  (405, 'MIN', 'For exploration drilling operations in coal or coal-bearing formations:', 'HSC', 'SEC', 3, 'system-mds', 'system-mds'),

-- GEOTECHNICAL SECTIONS
  (406, 'MIN', 'Reporting', 'GOC', 'SEC', 1, 'system-mds', 'system-mds'),
  (407, 'MIN', 'Site Stability', 'GOC', 'SEC', 2, 'system-mds', 'system-mds'),
  (408, 'MIN', 'Design', 'GOC', 'SEC', 3, 'system-mds', 'system-mds'),
  (409, 'MIN', 'Monitoring', 'GOC', 'SEC', 4, 'system-mds', 'system-mds'),

-- PROTECTION OF LAND AND WATERCOURSES
  (410, 'MIN', 'Cultural Heritage Resources', 'ELC', 'SEC', 1, 'system-mds', 'system-mds'),
  (411, 'MIN', 'Environmental Protection', 'ELC', 'SEC', 2, 'system-mds', 'system-mds'),
  (412, 'MIN', 'Invasive Species', 'ELC', 'SEC', 3, 'system-mds', 'system-mds'),
  (413, 'MIN', 'Works in and about a Stream:', 'ELC', 'SEC', 4, 'system-mds', 'system-mds'),
  (414, 'MIN', 'Inter-seasonal Condition of the Land', 'ELC', 'SEC', 5, 'system-mds', 'system-mds'),

-- RECLAMATION AND CLOSURE PROGRAM
  (415, 'MIN', 'Reclamation Security', 'RCC', 'SEC', 1, 'system-mds', 'system-mds'),
  (416, 'MIN', 'Obligation to Reclaim', 'RCC', 'SEC', 2, 'system-mds', 'system-mds'),
  (417, 'MIN', 'Reclamation', 'RCC', 'SEC', 3, 'system-mds', 'system-mds'),
  (418, 'MIN', 'Roads and Trails', 'RCC', 'SEC', 4, 'system-mds', 'system-mds')
on conflict do nothing;


-- UPDATE MINERAL AND COAL SEED 
INSERT INTO standard_permit_conditions
(standard_permit_condition_id, notice_of_work_type, parent_standard_permit_condition_id, condition, condition_category_code, condition_type_code, display_order, create_user, update_user)
VALUES
-- GENERAL CONDITIONS/LIST-ITEMS/CONDITIONS
  (419, 'MIN', 400, 'This permit authorizes only the following mining activities as outlined in the Mine Plan and Reclamation Program. Mining activities conducted that are not listed below are considered to be undertaken without a permit as required by Mines Act 10(1): Write out activities and total disturbance as indicated in the Notice of Work application (that you approve of – you must specify activities that were applied for that you do not approve of if there are any) for example;', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),

  (420, 'MIN', 419, 'Approved Activities:', 'GEC', 'LIS', 1, 'system-mds', 'system-mds'),  

  (421, 'MIN', 420, 'Work Related Structures: Core tent, office, dry tent, first aid etc. [xx.x ha]', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (422, 'MIN', 420, 'Geophysical Survey with exposed electrodes: line kms/area [xx.x ha]', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),  
  (423, 'MIN', 420, 'Surface Drilling: # of sites [xx.x ha]', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),  
  (424, 'MIN', 420, 'Helipads: #of sites [xx.x ha]', 'GEC', 'CON', 4, 'system-mds', 'system-mds'),  
  (425, 'MIN', 420, 'Trenching/Bulk sampling: # of sites, dimensions [xx.x ha]', 'GEC', 'CON', 5, 'system-mds', 'system-mds'),  
  (426, 'MIN', 420, 'Exploration Access Construction/Modification: description, dimensions, etc [xx.x ha]', 'GEC', 'CON', 6, 'system-mds', 'system-mds'),  
  (427, 'MIN', 420, 'Other: list description of any other authorized activities [xx.x ha]', 'GEC', 'CON', 7, 'system-mds', 'system-mds'),  
  (428, 'MIN', 420, 'For a total disturbance area of [x.xx ha]', 'GEC', 'CON', 8, 'system-mds', 'system-mds'),   

  (429, 'MIN', 419, 'Activities not approved:', 'GEC', 'LIS', 2, 'system-mds', 'system-mds'),  

  (430, 'MIN', 429, 'Fording of watercourses is not authorized.; add others if necessary', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),  

  (431, 'MIN', 419, 'Activities must be conducted within the permit area illustrated by [Figure #][Permit Area Map]. <<OR>> Activities must be conducted within the permit area illustrated by [Figure #][Permit Area Map], and located as shown in [Figure X, Figure Y and Figure Z.] <<OR>> Activities must be conducted within the permit area illustrated by [Figure #][Permit Area Map]. [specific activity/ies)] must be constructed only in the location(s) shown in [Figure X, Figure Y and Figure Z.]', 'GEC', 'LIS', 3, 'system-mds', 'system-mds'),  
  (432, 'MIN', 419, 'This permit approval is valid until <<approval end date>>.', 'GEC', 'LIS', 4, 'system-mds', 'system-mds'),  
  (433, 'MIN', 419, 'Authorized activities are restricted to the period from [seasonal date interval] [unless xyz occurs]', 'GEC', 'LIS', 5, 'system-mds', 'system-mds'),  
  (434, 'MIN', 419, 'A Maximum [Annual] Produced Tonnage of <<annual_tonnes>>;', 'GEC', 'LIS', 6, 'system-mds', 'system-mds'),  
  (435, 'MIN', 419, 'The use of all-terrain vehicles (ATVs) and utility task vehicles (UTVs) is [not authorized/restricted to business purposes/restricted to authorized exploration access].', 'GEC', 'LIS', 7, 'system-mds', 'system-mds'),  
  (436, 'MIN', 419, 'The construction of new access is limited to spur roads of no more than [50m/100m/200m, etc.] in length from the existing access as shown on the attached mapping. [Figure X, Figure Y and Figure Z.]', 'GEC', 'LIS', 8, 'system-mds', 'system-mds'),  


  (437, 'MIN', 401, 'A completed Annual Summary of Exploration Activities (ASEA) form must be submitted to [Regional Mines Office e-mail Inbox] prior to March 31 annually and must be accompanied by:', 'GEC', 'CON', 1, 'system-mds', 'system-mds'), 

  (438, 'MIN', 437, 'A detailed as-built map of the mine site.', 'GEC', 'LIS', 1, 'system-mds', 'system-mds'),  
  (562, 'MIN', 437, 'Shapefiles of the as-built disturbances which include attribution data for the status of reclamation.', 'GEC', 'LIS', 2, 'system-mds', 'system-mds'),  


  (439, 'MIN', 401, 'For Multi-Year Area-Based (‘MYAB’) work programs, a MYAB annual update form must be submitted annually to [Regional Mines Office e-mail Inbox].  The MYAB update must be submitted at least two (2) weeks prior to the anticipated commencement of exploration activities in a new calendar year, or no later than March 31 for every year the MYAB approval is in effect.  In addition to the required mapping, the Permittee must submit shapefiles of current and proposed disturbances;', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),  
  (440, 'MIN', 401, 'Work in subsequent years from the approval date for MYAB work programs must not commence without written approval from the Chief Permitting Officer based on the review of the annual update and receipt of any additional reclamation security as required by the Chief Permitting Officer.', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),  
  
  (441, 'MIN', 402, 'Unless otherwise approved in writing by the Chief Permitting Officer, all reports required to be submitted under this permit must be signed by a Qualified Professional.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),  

  -- HEALTH AND SAFETY CONDITIONS/LIST-ITEMS/CONDITIONS
  (442, 'MIN', 403, 'The MERP must be maintained on the mine site and made available to an inspector upon request.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),

  (443, 'MIN', 404, 'Handling, transportation and storage of fuels and lubricants must conform to the requirements of the document:  BC Fuel Guidelines, 9th Edition, March 2020 (NorthWest Response Ltd), or most recent version thereof.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),

  (444, 'MIN', 405, 'Measures to manage the risk of loss of control of the drill hole due to an uncontrolled release of pressurized fluids must be taken.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'), 
  (445, 'MIN', 405, 'The following must be developed by a qualified professional of drilling and made available to an inspector upon request:', 'HSC', 'CON', 2, 'system-mds', 'system-mds'), 

  (446, 'MIN', 445, 'A safe operating procedure including the following:', 'HSC', 'LIS', 1, 'system-mds', 'system-mds'),

  (447, 'MIN', 446, 'Gas detection and monitoring, including for flammable and toxic gases;', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),
  (448, 'MIN', 446, 'Any preventative equipment to be used to divert gases or prevent the uncontrolled release of pressurized fluids;', 'HSC', 'CON', 2, 'system-mds', 'system-mds'),
  (449, 'MIN', 446, 'Training requirements for field and drilling personnel regarding procedures, assignment of responsibilities and operation of monitoring and preventative equipment;', 'HSC', 'CON', 3, 'system-mds', 'system-mds'),

  (450, 'MIN', 445, 'Requirements and procedures for decommissioning, which may include capping or cementing, to ensure that fluids will not leak from the drill hole, and', 'HSC', 'LIS', 2, 'system-mds', 'system-mds'),


  (451, 'MIN', 405, 'If control of a drill hole is lost or compromised, all actions necessary must be taken without delay to safely bring the hole under control.', 'HSC', 'CON', 3, 'system-mds', 'system-mds'), 

  -- GEOTECHNICAL CONDITIONS/LIST-ITEMS/CONDITIONS
  (452, 'MIN', 406, 'The Chief Inspector must be advised in writing upon discovery of any unforeseen conditions that could adversely affect the extraction of materials, site stability, erosion control or the reclamation of the site.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  (453, 'MIN', 406, 'An Advice of Geotechnical Incident form must be submitted to the Chief Inspector for any geotechnical incident that:', 'GOC', 'CON', 2, 'system-mds', 'system-mds'),  

  (454, 'MIN', 453, 'is classified as a dangerous occurrence,', 'GOC', 'LIS', 1, 'system-mds', 'system-mds'),  
  (455, 'MIN', 453, 'requires changes to an existing standard operating procedure or the creation of a site-specific safe work plan,', 'GOC', 'LIS', 2, 'system-mds', 'system-mds'),  

  (456, 'MIN', 407, 'Stockpiles of waste, overburden or soil must not be placed in areas identified as Terrain Class IV or V.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),

  (457, 'MIN', 408, 'Prior to initiating road or trail construction, a qualified person must determine the terrain stability classification for all areas where roads and trails are to be constructed.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  (458, 'MIN', 408, 'All access roads, drill sites, equipment laydowns and trenches on terrain Class IV or V must be constructed, maintained and operated per the written recommendations of a qualified professional. The signed and sealed design reports must be maintained on site and made available to an Inspector upon request.', 'GOC', 'CON', 2, 'system-mds', 'system-mds'),


  -- PROTECTION OF LAND AND WATERCOURSES CONDITIONS/LIST-ITEMS/CONDITIONS
  (459, 'MIN', 410, 'The Archaeological Chance Find Procedure (‘CFP’) (Document 1.4 – update as required) must be implemented prior to commencement of work.  All employees and contractors on or visiting the mine site must be trained on the CFP.  The plan must be maintained on site and available to an Inspector upon request.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (460, 'MIN', 410, 'In addition to [Document XX] – update as required), [First Nation’s Name]’s CFP must be implemented prior to commencement of work. All employees and contractors at the mine site must be trained on the [First Nation’s Name]’s CFP.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (461, 'MIN', 410, 'The recommendations provided in the document: [Name of Archeological Study document, Date (Author of document)] must be implemented.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (462, 'MIN', 410, 'Prior to any ground disturbance, evaluation for archaeological potential in the area of work must be conducted by a qualified person. Any recommendations provided by a qualified person resulting from this evaluation must be implemented.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (463, 'MIN', 410, 'Prior to any ground disturbance, an Archaeological Overview Assessment (AOA) covering the planned work area(s) must be conducted. Preliminary Field Reconnaissance (PFR) must be conducted by a qualified person in areas of moderate to high archaeological potential that overlap planned disturbances. <<OR>> Prior to any ground disturbance, an Archaeological Overview Assessment (AOA) covering the planned work area(s) must be conducted. An Archaeological Impact Assessment (AIA) must be completed in areas of high archaeological potential that overlap planned disturbances.', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),

  (465, 'MIN', 411, 'Garbage and other attractants must be removed from work sites daily and must either be incinerated or stored in an airtight container until removed from the mine site.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (466, 'MIN', 411, 'Water intakes must comply with the Freshwater Intake End-of-Pipe Fish Screen Guideline, 1995 (Department of Fisheries and Oceans), or most recent version thereof.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (467, 'MIN', 411, 'Erosion and sediment must be effectively controlled on the mine site. Sediment laden water must be suitably contained on the mine site and not be allowed access to any watercourse.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (468, 'MIN', 411, 'Dust originating from the mine site must be controlled at the source.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (469, 'MIN', 411, '[Plan Name, Date (Author of Plan)] must be implemented on site.', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),
  (470, 'MIN', 411, 'Authorized activities are restricted to the period from [July 16th – October 31st], unless a [mountain goat/caribou/mountain sheep/moose/grizzly bear/wildlife management plan] is developed and submitted to [Regional Mines Office e-mail Inbox] for the approval of the Chief Permitting Officer. The [Plan Name] must be implemented upon commencement of work.', 'ELC', 'CON', 6, 'system-mds', 'system-mds'),
  (471, 'MIN', 411, 'All flight paths must be recorded using a spatial recording system and the raw data must be available upon request to an inspector at the end of each field season.', 'ELC', 'CON', 7, 'system-mds', 'system-mds'),
  (472, 'MIN', 411, 'For any discharge of sediment laden water originating from the mine site, immediate measures must be taken to prevent further and future discharges.', 'ELC', 'CON', 8, 'system-mds', 'system-mds'),

  (473, 'MIN', 472, 'Discharge that reaches a surface water body must be documented with estimates on flow rate and photographs and reported to the Chief Inspector at [Regional Mines e-mail Inbox] within 24 hours of discovery. <<OR>> for advanced exploration:', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),

  (474, 'MIN', 411, 'Any significant releases of sediment-laden water, defined as an unauthorized discharge to the receiving environment, must be appropriately characterized with respect to extent and loading, and reported to the Chief Inspector at [Regional Mines Office e-mail Inbox] within [28 days] of discovery.', 'ELC', 'CON', 9, 'system-mds', 'system-mds'),
  (475, 'MIN', 474, 'Characterization of unauthorized discharges of sediment-laden run-off must include, at a minimum, flow, total suspended solids, turbidity, pH, conductivity, temperature, dissolved oxygen, and total and dissolved metals, of both the effluent and the receiving water.', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),
  
  (476, 'MIN', 412, 'Invasive plants on the site must be identified, monitored, controlled and documented. Monitoring and treatment records must be made available to an Inspector upon request.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (477, 'MIN', 412, 'Reasonable efforts must be taken to ensure that weeds do not migrate from the site to adjacent areas.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (478, 'MIN', 412, 'The control of invasive plants must consider using non-toxic means for weed control.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (479, 'MIN', 412, '[At least 90 days] prior to the commencement of work under this Permit, an Invasive Species Management Plan must be developed to the satisfaction of the Chief Permitting Officer and the plan must be implemented in doing any work under this Permit.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (480, 'MIN', 412, '[Name of Plan, Date (Author of Plan)] must be implemented on site.', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),

  (481, 'MIN', 413, 'Instream Works:', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (482, 'MIN', 481, 'Timing:', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),

  (483, 'MIN', 482, 'If works are proposed on a stream that contains fish (fish-bearing), all works must be completed during the applicable timing window to protect fish, wildlife or the aquatic ecosystem within that stream. Timing windows represent periods during which works can occur to ensure the lowest risk to environmental and fisheries values.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (484, 'MIN', 482, 'If any of the following conditions are met, the timing window is not applicable:', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),

  (485, 'MIN', 484, 'If the stream channel is naturally dry (no flow) or frozen to the bottom at the worksite and the instream activity will not adversely impact fish habitat (e.g. result in the introduction of sediment into fish habitat).', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (486, 'MIN', 484, 'If construction of a winter crossing is proposed and such works does not adversely impact the stream channel (including stream banks), fish habitat or fish passage. ', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (487, 'MIN', 484, 'The structure does not encroach below the high-water mark, no work is proposed below the high-water mark of a fish stream, and measures will be taken to prevent the delivery of sediments or contaminants into fish habitat.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (488, 'MIN', 484, 'You retain a Qualified Professional (such as a Registered Professional Biologist) to prepare a prescription that provides specific measures to comply with the windows and to prevent impacts to fish or fish habitat. This document must be submitted to [ Regional Mines Office e-mail Inbox] with reference to your Notice of Work number <<Notice of work #>>.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (489, 'MIN', 484, 'Work is in a non-fish stream and measures will be taken to prevent the delivery of sediments into downstream fish habitat or the stream is not fish-bearing and discontinuous with no connection to downstream fish habitat.', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),

  (490, 'MIN', 481, 'Design requirements:', 'ELC', 'LIS', 2, 'system-mds', 'system-mds'),

  (491, 'MIN', 490, 'The original rate of water flow in the stream (existing prior to commencing work) must be maintained upstream and downstream of the worksite during all phases of instream activity associated with the work;', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (492, 'MIN', 490, 'If the stream is fish-bearing, the culvert allows fish in the stream to pass up or down stream under all flow conditions;', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (493, 'MIN', 490, 'Debris can pass through the culvert;', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (494, 'MIN', 490, 'The culvert and its approach roads do not produce a backwater effect or increase the head of the stream;', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (495, 'MIN', 490, 'The culvert is installed in a manner that permits the removal of obstacles and debris within the culvert and at the culvert ends;', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),
  (496, 'MIN', 490, 'Embankment fill materials do not, and are unlikely to, encroach on culvert inlets and outlets;', 'ELC', 'CON', 6, 'system-mds', 'system-mds'),
  (497, 'MIN', 490, 'The culvert has a depth of fill cover that is at least 300 mm or as required by the culvert manufacturers specifications;', 'ELC', 'CON', 7, 'system-mds', 'system-mds'),
  (498, 'MIN', 490, 'The culvert is made of materials that meet the applicable standards of the Canadian Standards Association;', 'ELC', 'CON', 8, 'system-mds', 'system-mds'),
  (498, 'MIN', 490, 'The culvert capacity is equivalent to the hydraulic capacity of the stream channel or is capable of passing the 1 in 200 year maximum daily flow without the water level at the culvert inlet exceeding the top of the culvert;', 'ELC', 'CON', 9, 'system-mds', 'system-mds'),
  (500, 'MIN', 490, 'The culvert has a minimum equivalent diameter of 600 mm;', 'ELC', 'CON', 10, 'system-mds', 'system-mds'),
  (501, 'MIN', 490, 'Any stream within the mine site must be assumed to be fish bearing unless determined otherwise by a qualified professional.', 'ELC', 'CON', 11, 'system-mds', 'system-mds'),

  (502, 'MIN', 481, 'Construction:', 'ELC', 'LIS', 3, 'system-mds', 'system-mds'),

  (503, 'MIN', 502, 'The equipment used for site preparation, or for installation, construction, maintenance or removal of the culvert, is situated in a dry stream channel or operated from the top of the bank;', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (504, 'MIN', 502, 'The stream channel width must not change as a result of the work.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (505, 'MIN', 502, 'The permanent removal of stable, naturally occurring material from the stream or stream channel must be minimized and completed only as necessary;', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (506, 'MIN', 502, 'All activities in and about streams must be conducted in a manner that does not cause harm to fish or fish habitat and species at risk or their habitat;', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (507, 'MIN', 502, 'The removal of material must not lead to stream channel instability or increase the risk of sedimentation into the watercourse immediately downstream of the worksite;', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),
  (508, 'MIN', 502, 'Any spoil materials must be deposited in a stable area and in such a way that the excavated material will not contribute sediment or debris to the stream or adversely impact riparian habitats or species at risk and their habitats;', 'ELC', 'CON', 6, 'system-mds', 'system-mds'),
  (509, 'MIN', 502, 'A qualified person must supervise installation of all stream crossings.', 'ELC', 'CON', 7, 'system-mds', 'system-mds'),
  
  (510, 'MIN', 481, 'Erosion and Sediment Control:', 'ELC', 'LIS', 4, 'system-mds', 'system-mds'),

  (511, 'MIN', 510, 'The culvert inlet and outlet incorporate measures to protect the structure and the stream channel against erosion;', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (512, 'MIN', 510, 'Any work associated with the proposed changes in and about a stream must not cause stream channel instability or increase the risk of sedimentation into the stream;', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (513, 'MIN', 510, 'Measures must be taken to ensure that no deleterious substances (e.g. fuel and other hydrocarbons, soil, road fill, or sediment), which could adversely impact water quality, fish and fish habitat and other aquatic life, can enter the stream channel. Equipment used in close proximity to the stream must be free of exposed deleterious substances;', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (514, 'MIN', 510, 'During works, erosion and sediment control materials must be available onsite at all times and must be installed if sedimentation is likely to occur into the stream (e.g. silt fences, straw bale dikes, settling basins, ditch blocks, or filter cloth). A contingency plan must be developed outlining the measures to be taken by workers when carrying out any work to control erosion and sediment. All erosion and sediment control devices must be regularly inspected and maintained to remain functional during works. These devices and any accumulated sediment must be removed from the site after the completion of works;', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (515, 'MIN', 510, 'Soil disturbance must not occur in heavy rain conditions and any soil removed must be placed in a location that ensures that sediment or debris does not enter the stream;', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),
  (516, 'MIN', 510, 'Work must be suspended if the sediment control measures are ineffective and result in the introduction of sediment into the stream. In the event of sediment release into a stream, permittees are directed to immediately stabilize and mitigate the release, and then notify the Inspector of Mines.', 'ELC', 'CON', 6, 'system-mds', 'system-mds'),
  (517, 'MIN', 510, 'During periods of heavy or persistent precipitation, work must stop if continuing the work will result in sediment delivery downstream of the immediate worksite. Measures must be taken to minimize the risk of on-going sediment delivery to the stream during the shutdown period;', 'ELC', 'CON', 7, 'system-mds', 'system-mds'),


  (518, 'MIN', 481, 'Protection of fish or Wildlife:', 'ELC', 'LIS', 5, 'system-mds', 'system-mds'),

  (519, 'MIN', 518, 'Open bottom structures such as clear span bridges or open bottom culverts are preferred on all fish bearing streams. If permittees wish to install a closed bottom culvert (e.g. round or elliptical) on a fish bearing stream, they must ensure that upstream fish passage through the culvert is maintained. In addition, closed bottom culverts must be embedded in order to provide a natural substrate such that there is no net loss of fish habitat. To achieve this, permittees must comply with the requirements detailed in Section 3.2 of the 2012 Fish-Stream Crossing Guidebook.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),


  (520, 'MIN', 481, 'Riparian Vegetation and Habitat:', 'ELC', 'LIS', 6, 'system-mds', 'system-mds'),

  (521, 'MIN', 520, 'Damage above the high water mark to values such as banks and stream side (riparian) vegetation in the vicinity of the work area must be minimized. Unavoidable impacts that occur must be remedied as per the reclamation section below;', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (522, 'MIN', 520, 'Any trees at the work site or within the clearing width area adjacent to streams that must be removed must be felled away from the stream to the fullest extent possible. Where this is not possible, the tree(s) and all resultant debris must be removed from the stream channel as soon as possible after felling, or at most, within the same workday by means that avoid machinery being placed within the stream channel;', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (523, 'MIN', 520, 'Minimize disturbance to natural materials, including but not necessarily limited to embedded logs and boulders, as well as vegetation that contribute to fish and wildlife habitat or stream channel stability;', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),

  (524, 'MIN', 481, 'Site Reclamation:', 'ELC', 'LIS', 7, 'system-mds', 'system-mds'),
  (525, 'MIN', 524, 'Complete required reclamation works on disturbed areas must be conducted according to the site-specific reclamation plans that will ensure function as close as possible to natural pre-disturbance conditions;', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (526, 'MIN', 524, 'Soils exposed as a result of work activities that have the potential for sediment delivery to the stream must be promptly re-vegetated. All disturbed soils adjacent to the stream must be re-vegetated with [a certified weed free mix of native species grasses, and suitable seedlings for the BEC zone] if necessary, as soon as works are completed or as soon as site conditions are conducive to growth; if seedlings are included in reclamation plans, they will be planted when material is available.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (527, 'MIN', 524, 'Any materials, such as riprap or gabion rock, used for stream bank armouring must be clean and not contain substances that could be harmful to fish, wildlife or the aquatic ecosystem of the stream.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),

  (528, 'MIN', 481, 'Construction, maintenance and removal of clear span bridges is approved subject to the following conditions:', 'ELC', 'LIS', 8, 'system-mds', 'system-mds'),

  (529, 'MIN', 528, 'The equipment used for site preparation, or for construction, maintenance or removal of the bridge is situated in a dry stream channel or operated from the top of the bank;', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (530, 'MIN', 528, 'The bridge and its approach roads do not produce a back water effect or increase the head of the stream;', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (531, 'MIN', 528, 'Bridge abutments or other structures and materials must not be placed within the stream channel width. Rip-rap must be keyed into the stream bank and must not constrict the natural stream channel width;', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (532, 'MIN', 528, 'The hydraulic capacity of the bridge is equivalent to the hydraulic capacity of the stream channel, or is capable of passing the 1 in 200 year maximum daily flow;', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (533, 'MIN', 528, 'The height of the underside of the bridge is adequate to provide free passage of flood debris and ice flows;', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),
  (534, 'MIN', 528, 'The bridge is made of materials that meet the applicable standards of the Canadian Standards Association.', 'ELC', 'CON', 6, 'system-mds', 'system-mds'),


  (535, 'MIN', 414, 'At the end of each field season, no more than [X#] drill sites are to be left un-reclaimed', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (536, 'MIN', 414, 'At the end of each season, drill site timbers not in use must either be removed from site or neatly stockpiled in one location in the permit area such that they will not be scattered by weather effects.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (537, 'MIN', 414, 'All equipment brought on to the site must be removed from the project by [dd/mm of each year].', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (538, 'MIN', 414, 'Derelict or damaged equipment, supplies, or materials must not be stored or otherwise left or abandoned anywhere on property.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (539, 'MIN', 414, 'At the end of each field season, disturbed areas are to be left in a condition that is neat, clean and safe.', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),


    -- RECLAMATION AND CLOSURE PROGRAM CONDITIONS/LIST-ITEMS/CONDITIONS
  (540, 'MIN', 415, '[X dollars] $<<bond_amt>> in security must be maintained with the Minister of Finance.', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (541, 'MIN', 540, 'The security must be deposited in accordance with the following installment schedule:', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),

  (542, 'MIN', 541, 'Prior to the mobilization of heavy equipment to the site for the purposes of construction of <<description of activity>>: <<$Dollar amount>> for a subtotal of <<$Dollar Amount>>; and', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (543, 'MIN', 541, 'Within {Enter time} months following the start of construction of <<description of activity>>: <<$Dollar Amount>> for a total of <<$Dollar Amoun>>.', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),

  
  (544, 'MIN', 416, 'Reclamation of the surface of the land affected by the operations must be conducted in accordance with the approved work program. The surface of the land and watercourses must be reclaimed to the following end land use: <<land_use>>;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (545, 'MIN', 416, 'Reclamation obligations include [xxx disturbance(s)], but exclude [xxx disturbance(s)].', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),

  (546, 'MIN', 417, 'All available topsoil, overburden, and organic material including large woody debris in the disturbance footprint must be salvaged and stockpiled for use in reclamation.', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (547, 'MIN', 417, 'All stockpiled topsoil, overburden, and organic material including large woody debris must be protected from erosion, degradation, and contamination.', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (548, 'MIN', 417, 'All stockpiles must be clearly marked to ensure that they are protected during construction and mine operations.', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),
  (549, 'MIN', 417, 'Stripped and stockpiled soil suitable for use in reclamation must not be used as fill.', 'RCC', 'CON', 4, 'system-mds', 'system-mds'),
  (550, 'MIN', 417, 'Topsoil must not be removed from the mine site without the specific written permission of an Inspector.', 'RCC', 'CON', 5, 'system-mds', 'system-mds'),
  (551, 'MIN', 417, 'Progressive reclamation must be conducted whenever practicable. Reclamation activities must include:', 'RCC', 'CON', 6, 'system-mds', 'system-mds'),

  (552, 'MIN', 551, 'Compacted surfaces must be de-compacted to allow water infiltration and achieve self-staining vegetation.', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (553, 'MIN', 551, 'Salvaged soil material must:', 'RCC', 'LIS', 2, 'system-mds', 'system-mds'),

  (554, 'MIN', 553, 'be replaced on disturbed areas to pre-disturbance depth;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (555, 'MIN', 553, 'be treated with a rough and loose site preparation where practicable;', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (556, 'MIN', 553, 'be keyed into the underlying materials such that they do not slump off or become unstable;', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),
  (557, 'MIN', 553, 'incorporate roots, stumps and other woody debris to reduce erosion and create greater biological diversity; and', 'RCC', 'CON', 4, 'system-mds', 'system-mds'),
  (558, 'MIN', 553, 'be re-vegetated promptly to a self-sustaining state using appropriate and/or native plant species that support approved end land use.', 'RCC', 'CON', 5, 'system-mds', 'system-mds'),

  (559, 'MIN', 418, 'Individual roads and trails will be exempted from the requirement for total reclamation if either:', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),

  (560, 'MIN', 559, 'It can be demonstrated that an agency of the Crown has accepted responsibility in writing for the operation, maintenance and reclamation of the road or trail; or', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (561, 'MIN', 559, 'The Chief Permitting Officer provides notification that the road should not be reclaimed due to the use or potential use by other users who will assume liability.', 'RCC', 'LIS', 2, 'system-mds', 'system-mds')
on conflict do nothing;


-- -- -- UPDATE QUARY SEED PARENTS
INSERT INTO standard_permit_conditions
(standard_permit_condition_id, notice_of_work_type, condition, condition_category_code, condition_type_code, display_order, create_user, update_user)
VALUES
-- QCA starts at 600
-- GENERAL SECTIONS
	(600, 'QCA', 'Approval', 'GEC', 'SEC', 1, 'system-mds', 'system-mds'),
  (601, 'QCA', 'Documentation and Reporting', 'GEC', 'SEC', 2, 'system-mds', 'system-mds'),
  (602, 'QCA', 'Reports to be signed by a Qualified Professional:', 'GEC', 'SEC', 3, 'system-mds', 'system-mds'),

-- HEALTH AND SAFETY SECTIONS
  (603, 'QCA', 'Mine Emergency Response Plan (MERP)', 'HSC', 'SEC', 1, 'system-mds', 'system-mds'),
  (604, 'QCA', 'Fuels and Lubricant Handling, Transportation and Storage', 'HSC', 'SEC', 2, 'system-mds', 'system-mds'),
  (605, 'QCA', 'Blasting', 'HSC', 'SEC', 3, 'system-mds', 'system-mds'),

-- GEOTECHNICAL SECTIONS
  (606, 'QCA', 'Reporting', 'GOC', 'SEC', 1, 'system-mds', 'system-mds'),
  (607, 'QCA', 'Site Stability', 'GOC', 'SEC', 2, 'system-mds', 'system-mds'),
  (608, 'QCA', 'Design', 'GOC', 'SEC', 3, 'system-mds', 'system-mds'),
  (609, 'QCA', 'Monitoring', 'GOC', 'SEC', 4, 'system-mds', 'system-mds'),

-- PROTECTION OF LAND AND WATERCOURSES
  (610, 'QCA', 'Cultural Heritage Resources', 'ELC', 'SEC', 1, 'system-mds', 'system-mds'),
  (611, 'QCA', 'Environmental Protection', 'ELC', 'SEC', 2, 'system-mds', 'system-mds'),
  (612, 'QCA', 'Invasive Species', 'ELC', 'SEC', 3, 'system-mds', 'system-mds'),
  (613, 'QCA', 'Receiving Foreign Materials', 'ELC', 'SEC', 4, 'system-mds', 'system-mds'),
  (614, 'QCA', 'Metal Leaching / Acid Rock Drainage', 'ELC', 'SEC', 5, 'system-mds', 'system-mds'),
  (615, 'QCA', 'Erosion and Sediment Control', 'ELC', 'SEC', 6, 'system-mds', 'system-mds'),
  (616, 'QCA', 'Water Management, Monitoring and Reporting', 'ELC', 'SEC', 7, 'system-mds', 'system-mds'),
  (617, 'QCA', 'Condition of the Land', 'ELC', 'SEC', 8, 'system-mds', 'system-mds'),

-- RECLAMATION AND CLOSURE PROGRAM
  (618, 'QCA', 'Reclamation Security', 'RCC', 'SEC', 1, 'system-mds', 'system-mds'),
  (619, 'QCA', 'Obligation to Reclaim', 'RCC', 'SEC', 2, 'system-mds', 'system-mds'),
  (620, 'QCA', 'Reclamation', 'RCC', 'SEC', 3, 'system-mds', 'system-mds'),
  (621, 'QCA', 'Roads and Trails', 'RCC', 'SEC', 4, 'system-mds', 'system-mds')
on conflict do nothing;


-- UPDATE QUARY SEED 
INSERT INTO standard_permit_conditions
(standard_permit_condition_id, notice_of_work_type, parent_standard_permit_condition_id, condition, condition_category_code, condition_type_code, display_order, create_user, update_user)
VALUES
-- GENERAL CONDITIONS/LIST-ITEMS/CONDITIONS
  (622, 'QCA', 600, 'This permit authorizes only the following mining activities as outlined in the Mine Plan and Reclamation Program. Mining activities conducted that are not listed below are considered to be undertaken without a permit as required by Mines Act 10(1): Write out activities and total disturbance as indicated in the Notice of Work application (that you approve of – you must specify activities that were applied for that you do not approve of if there are any) for example;', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (623, 'QCA', 622, 'Approved Activities:', 'GEC', 'LIS', 1, 'system-mds', 'system-mds'),

  (624, 'QCA', 623, 'Work Related Structures: office, storage buildings, first aid etc. [xx.x ha]', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (625, 'QCA', 623, 'Mining Area(s): [xx.x ha]', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),
  (626, 'QCA', 623, 'Stockpile Area(s): [xx.x ha]', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),
  (627, 'QCA', 623, 'Processing Area/Infrastructure: [xx.x ha]', 'GEC', 'CON', 4, 'system-mds', 'system-mds'),
  (628, 'QCA', 623, 'Settling Pond(s): # of sites, dimensions [xx.x ha]', 'GEC', 'CON', 5, 'system-mds', 'system-mds'),
  (629, 'QCA', 623, 'Access Construction/Modification: description, dimensions, etc [xx.x ha]', 'GEC', 'CON', 6, 'system-mds', 'system-mds'),
  (630, 'QCA', 623, 'Other: list description of any other authorized activities [xx.x ha]', 'GEC', 'CON', 7, 'system-mds', 'system-mds'),
  (631, 'QCA', 623, 'For a total disturbance area of [x.xx ha]', 'GEC', 'CON', 8, 'system-mds', 'system-mds'),

  (632, 'QCA', 622, 'Activities not approved:', 'GEC', 'LIS', 2, 'system-mds', 'system-mds'),

  (633, 'QCA', 632, 'Fording of watercourses is not authorized.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (634, 'QCA', 632, 'Washing of aggregates is not authorized.', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),

  (634, 'QCA', 622, 'Activities must be conducted within the permit area illustrated by Figure # [Permit Area Map], and located as shown in [Figure X, Figure Y and Figure Z].', 'GEC', 'LIS', 3, 'system-mds', 'system-mds'),
  (635, 'QCA', 622, 'This permit approval is valid until <<approval end date>>.', 'GEC', 'LIS', 4, 'system-mds', 'system-mds'),
  (636, 'QCA', 622, 'Authorized activities are restricted to the period from [seasonal date interval] [unless xyz occurs]', 'GEC', 'LIS', 5, 'system-mds', 'system-mds'),
  (637, 'QCA', 622, 'Authorized activities are restricted to the following schedule [daily operating hours, or operating hours listed by day of week].', 'GEC', 'LIS', 6, 'system-mds', 'system-mds'),
  (638, 'QCA', 622, 'A Maximum [Annual] Produced Tonnage of <<annual_tonnes>>;', 'GEC', 'LIS', 7, 'system-mds', 'system-mds'),


  (639, 'QCA', 601, 'This Permit and the associated approved Mine Plan and Reclamation Program must be kept at the mine and must be available to an Inspector upon request.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (640, 'QCA', 601, 'A completed Annual Summary of Work and Reclamation form must be submitted to [Regional Mines Office e-mail Inbox] prior to March 31 annually and must be accompanied by:', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),
  (641, 'QCA', 640, 'A detailed as-built map of the mine site.', 'GEC', 'LIS', 1, 'system-mds', 'system-mds'),
  (642, 'QCA', 640, 'Shapefiles of the as built disturbances which include attribution data for the status of reclamation.', 'GEC', 'LIS', 2, 'system-mds', 'system-mds'),
  
  (643, 'QCA', 601, 'Seven days prior to commencement of crushing, screening, or washing operations, written notification must be provided to the regional Inspector.  The notification must include the start date and the anticipated end date of the operation and be submitted to [Regional Mines Office e-mail Inbox].', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),

  (644, 'QCA', 602, 'Unless otherwise approved in writing by the Chief Permitting Officer, all reports required to be submitted under this permit must be signed by a Qualified Professional.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),

  -- HEALTH AND SAFETY CONDITIONS/LIST-ITEMS/CONDITIONS
  (645, 'QCA', 603, 'The MERP must be maintained on the mine site and made available to an inspector upon request.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),
  (646, 'QCA', 604, 'Handling, transportation and storage of fuels and lubricants must conform to the requirements of the document: BC Fuel Guidelines, 9th Edition, March 2020 (NorthWest Response Ltd), or most recent version thereof.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),

  (647, 'QCA', 605, '[At least 90 days] prior to starting any work under this Permit, a blasting plan must be developed and submitted to [Regional Mines Office email] for the approval of the Chief Permitting Officer. The blasting plan must be implemented upon commencement of work.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),
  (648, 'QCA', 605, 'The Manager must provide written notification, fourteen days prior to a blast notify the Senior Health & Safety Inspector for the [South Central Region] at [Regional Mines Office email].', 'HSC', 'CON', 2, 'system-mds', 'system-mds'),
  (649, 'QCA', 605, 'Blasting is not authorized to occur between [Date Range or Time Range or  Other Schedule].', 'HSC', 'CON', 3, 'system-mds', 'system-mds'),
  (650, 'QCA', 605, 'Blast patterns must be designed by a qualified person to eliminate fly-rock;', 'HSC', 'CON', 4, 'system-mds', 'system-mds'),
  (651, 'QCA', 605, 'No blasting will be permitted under overcast conditions;', 'HSC', 'CON', 5, 'system-mds', 'system-mds'),
  (652, 'QCA', 605, 'All blasts must occur between [Monday to Friday between 10am and 5pm], blasting must not occur on Statutory Holidays;', 'HSC', 'CON', 6, 'system-mds', 'system-mds'),
  (653, 'QCA', 605, 'Controlled blasting methods (e.g. trim and buffer, pre/post shear) must be implemented to minimize damage to the crest and bench face of all final walls and on any interim walls that will be in place for a period exceeding 12 months.', 'HSC', 'CON', 7, 'system-mds', 'system-mds'),
  (654, 'QCA', 653, 'Controlled blasting may be omitted where a Professional Engineer assesses conditions and states in writing that worker safety will not be adversely endangered by the proposed excavation.', 'HSC', 'LIS', 1, 'system-mds', 'system-mds'),
  
  (655, 'QCA', 605, 'All blasts must be electronically monitored.', 'HSC', 'CON', 8, 'system-mds', 'system-mds'),
  (656, 'QCA', 605, 'Blast limits are established at 50 millimeters per second peak particle velocity and 120 decibels on the L scale, at the property boundary.', 'HSC', 'CON', 9, 'system-mds', 'system-mds'),
  (657, 'QCA', 605, 'The electronic monitor unit must be located such that the air pressure (microphone) sensor has a clear unobstructed line of sight to the centre of the blast. The Inspector may allow or require monitoring at specific locations on a case by case basis as may be required.', 'HSC', 'CON', 10, 'system-mds', 'system-mds'),
  (658, 'QCA', 605, 'A signed copy of the Blast Log for each blast and a copy of the Electronic Monitor Record must be maintained at on the mine site. Such records must be made available to the Inspector on request.', 'HSC', 'CON', 11, 'system-mds', 'system-mds'),
  (659, 'QCA', 605, 'To the extent practical, all blasts initiated on the quarry must be videoed, and a copy of the video must be kept at the mine office and made available to the Inspector on request.', 'HSC', 'CON', 12, 'system-mds', 'system-mds'),

  (660, 'QCA', 659, 'The video file must include the following identification information as a word document:', 'HSC', 'LIS', 1, 'system-mds', 'system-mds'),
  (661, 'QCA', 659, 'the pit name, and mine number', 'HSC', 'LIS', 2, 'system-mds', 'system-mds'),
  (662, 'QCA', 659, 'the bench/location identification, including a map showing the location on the mine footprint.', 'HSC', 'LIS', 3, 'system-mds', 'system-mds'),
  (663, 'QCA', 659, 'the name of the blaster', 'HSC', 'LIS', 4, 'system-mds', 'system-mds'),
  (664, 'QCA', 659, 'the date of the blast', 'HSC', 'LIS', 5, 'system-mds', 'system-mds'),
  (665, 'QCA', 659, 'the time of the blast', 'HSC', 'LIS', 6, 'system-mds', 'system-mds'),

  -- GEOTECHNICAL CONDITIONS/LIST-ITEMS/CONDITIONS
  (666, 'QCA', 606, 'The Chief Inspector must be advised in writing at the earliest opportunity of any unforeseen conditions that could adversely affect the extraction of materials, site stability, erosion control or the reclamation of the site;', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  (667, 'QCA', 606, 'An Advice of Geotechnical Incident form must be submitted to the Chief Inspector for any geotechnical incident that:', 'GOC', 'CON', 2, 'system-mds', 'system-mds'),

  (668, 'QCA', 667, 'Is classified as a dangerous occurrence,', 'GOC', 'LIS', 1, 'system-mds', 'system-mds'),
  (669, 'QCA', 667, 'Requires changes to an existing standard operating procedure or the creation of a site-specific safe work plan,', 'GOC', 'LIS', 2, 'system-mds', 'system-mds'),
  (670, 'QCA', 667, 'Is considered a multi-bench pit slope failure,', 'GOC', 'LIS', 3, 'system-mds', 'system-mds'),
  (671, 'QCA', 667, 'Is considered a spoil failure resulting in full loss of the crest berm, or', 'GOC', 'LIS', 4, 'system-mds', 'system-mds'),
  (672, 'QCA', 667, 'Is considered a sign of dam instability (regardless of size).', 'GOC', 'LIS', 5, 'system-mds', 'system-mds'),

  (673, 'QCA', 607, 'Stockpiles of waste, overburden or soil must not be placed in areas identified as Terrain Class IV or V.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  (674, 'QCA', 607, 'Final pit walls must be scaled during pit development to limit the potential for rock fall.', 'GOC', 'CON', 2, 'system-mds', 'system-mds'),

  (675, 'QCA', 608, 'Berms must be constructed at the toe of all waste dumps where rock rollout could present a safety hazard.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  (676, 'QCA', 608, 'All access roads, drill sites, equipment laydowns, trenches, and locations where cuts and/or fills exceed 6.0 meters on terrain Class IV or V must be constructed maintained and operated per the written recommendations of a qualified professional. The signed and sealed design reports must be maintained on site and made available an inspector upon request.', 'GOC', 'CON', 2, 'system-mds', 'system-mds'),

  (677, 'QCA', 609, '[At least 90 days] prior to starting any work under this Permit, a geotechnical monitoring plan must be developed, implemented in doing any work under this permit, maintained on site and made available an inspector upon request. The geotechnical monitoring plan must be established to detect early evidence of any potentially dangerous slope instability during operation.', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  (678, 'QCA', 677, 'The monitoring plan must include the instrument type, spacing, monitoring frequency, and appropriate initial threshold and response criteria for any required instrumentation.  The plan must be updated as needed to reflect the status of stockpile and waste dump development.', 'GOC', 'LIS', 1, 'system-mds', 'system-mds'),
 
  -- PROTECTION OF LAND AND WATERCOURSES CONDITIONS/LIST-ITEMS/CONDITIONS
  (679, 'QCA', 610, 'The Archaeological Chance Find Procedure (‘CFP’) (Document 1.4 – update as required) must be implemented prior to commencement of work.  All employees and contractors at the mine site must be trained on the CFP.  The plan must be maintained onsite and available to an Inspector upon request.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (680, 'QCA', 610, 'In addition to (Document 1.4 – update as required), [First Nation’s Name]’s CFP must be implemented prior to commencement of work. All employees and contractors at the mine site must be trained on the [First Nation’s Name]’s CFP.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (681, 'QCA', 610, 'Prior to any ground disturbance, evaluation for archaeological potential in the area of work must be conducted by a qualified professional. Any recommendations resulting from this evaluation, provided by a qualified professional, must be implemented.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (682, 'QCA', 610, 'Prior to any ground disturbance, an Archaeological Overview Assessment (AOA) covering the planned work area(s) must be conducted. Preliminary Field Reconnaissance (PFR) must be conducted by a qualified person in areas of moderate to high archaeological potential that overlap planned disturbances.  Any recommendations resulting from this evaluation, provided by a qualified professional, must be implemented. <<OR>> Prior to any ground disturbance, an Archaeological Overview Assessment (AOA) covering the planned work area(s) must be conducted. An Archaeological Impact Assessment (AIA) must be completed in areas of high archaeological potential that overlap planned disturbances.  Any recommendations resulting from this evaluation, provided by a qualified professional, must be implemented.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),

  (683, 'QCA', 611, 'Garbage and other attractants must be removed from work sites daily and must either be incinerated or stored in an airtight container until removed from the mine site.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (684, 'QCA', 611, 'Water intakes must comply with the Freshwater Intake End-of-Pipe Fish Screen Guideline, 1995 (Department of Fisheries and Oceans), or most recent version thereof.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (685, 'QCA', 611, 'No excavation is to be made within 1.5 meters of the groundwater table.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (686, 'QCA', 611, 'Settling ponds must be maintained regularly, with maintenance to include [xxx activities].', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (687, 'QCA', 611, 'A schedule and procedure for sediment removal from settling ponds must be implemented to ensure adequate settling of suspended solids. The information must be maintained on site and be available to an Inspector upon request.', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),
  (688, 'QCA', 611, 'Sediment removed from settling ponds must be contained and stockpiled for reclamation.', 'ELC', 'CON', 6, 'system-mds', 'system-mds'),
  (689, 'QCA', 611, 'Dust originating from the mine site must be controlled at the source.', 'ELC', 'CON', 7, 'system-mds', 'system-mds'),
  (690, 'QCA', 611, '[Plan Name, Date (Author of Plan)] must be implemented on site.', 'ELC', 'CON', 8, 'system-mds', 'system-mds'),
  (691, 'QCA', 611, '[At least 90 days] prior to starting any work under this Permit, the Permittee must develop and submit for the approval of the Chief Permitting Officer a [plan name] , and [must implement the approved plan in doing any work under this Permit] or [all work done under this Permit must be done in accordance with the approved plan].', 'ELC', 'CON', 9, 'system-mds', 'system-mds'),
  (692, 'QCA', 611, 'Daily monitoring of the functionality of settling ponds must be performed by the mine manager, and observations must be recorded in a written log. The written log must be made available to an Inspector upon request.', 'ELC', 'CON', 10, 'system-mds', 'system-mds'),
  (693, 'QCA', 611, 'Authorized activities are restricted to the period from [July 16th – October 31st], unless a mountain goat/caribou/mountain sheep/moose/grizzly bear/wildlife management plan is developed for the project by a qualified professional and approved by the Chief Permitting Officer.', 'ELC', 'CON', 11, 'system-mds', 'system-mds'),

  (694, 'QCA', 612, 'Invasive plants on the site must be identified, monitored, controlled and documented. Monitoring and treatment records must be made available to an Inspector upon request.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (695, 'QCA', 612, 'Reasonable efforts must be taken to ensure that weeds do not migrate from the site to adjacent areas.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (696, 'QCA', 612, 'The control of invasive plants must consider using non-toxic means for weed control.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (697, 'QCA', 612, 'The Permittee must ensure that all seed used on-site is certified weed free.[At least 90 days] prior to the commencement of work under this Permit, an Invasive Species Management Plan must be developed to the satisfaction of the Chief Permitting Officer and the plan must be implemented in doing any work under this Permit.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),
  (698, 'QCA', 612, '[Name of Plan, Date (Author of Plan)] must be implemented on site.', 'ELC', 'CON', 5, 'system-mds', 'system-mds'),

  (699, 'QCA', 613, 'The receipt, storage, treatment/processing and or use of imported materials including but not limited to garbage, refuse, concrete, asphalt, asphalt shingles, biosolids and soils originating from off site is not permitted unless authorized in writing by an Inspector.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  
  (700, 'QCA', 614, 'General', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (701, 'QCA', 700, 'All materials with the potential to generate ML/ARD must be placed in a manner that minimizes the production and release of metals and contaminants to levels that assure protection of environmental quality.', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),
  (702, 'QCA', 700, 'Unless otherwise approved, all plans for the prediction, and if necessary, the prevention, mitigation and management of metal leaching and acid rock drainage must be prepared in accordance with the Guidelines for Metal Leaching and Acid Rock Drainage at Minesites in British Columbia (1998).', 'ELC', 'LIS', 2, 'system-mds', 'system-mds'),

  (703, 'QCA', 614, 'Definition of Potentially Acid Generating (PAG) and Metal Leaching (ML) Materials', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (704, 'QCA', 703, 'Neutralization potential (NP) using total inorganic carbon.', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),
  (705, 'QCA', 703, 'Acid potential (AP) using total sulphur.', 'ELC', 'LIS', 2, 'system-mds', 'system-mds'),
  (706, 'QCA', 703, 'All waste materials and mine surfaces must be classified as potentially acid generating (PAG) if they have a NP/AP ratio of less than 2.0.', 'ELC', 'LIS', 3, 'system-mds', 'system-mds'),
  (707, 'QCA', 703, 'Material classified as PAG must not be used for construction.', 'ELC', 'LIS', 4, 'system-mds', 'system-mds'),

  (708, 'QCA', 614, 'ML/ARD Operational Monitoring', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (709, 'QCA', 708, '[Plan Name, Date (Author of Plan – ML/ARD Prediction Plan)] must be implemented on the mine site.', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),
  (710, 'QCA', 708, 'Concurrent with excavation, the Permittee must implement a monitoring program to confirm the geochemical characteristics of excavated materials produced and mine surfaces exposed, to determine the potential for ML/ARD and the need for mitigation measures to ensure protection of environmental quality.', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),
  (711, 'QCA', 710, 'At a minimum, the monitoring program must include the characterization of excavated materials at frequency of three samples for every 10,000 tonnes. Each sample must be submitted to an accredited lab and analyzed for sufficient parameters to determine the AP, NP, and total dissolved metals.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),

  (712, 'QCA', 708, 'A report, authored by a qualified professional, summarizing the results of the operational monitoring must be submitted to [Regional Mines Office e-mail] prior to March 31 annually. The report must include a description of the geology encountered, interpretation of all ML/ARD monitoring results, a description of any mitigation strategies undertaken during the program, and an assessment of whether additional mitigation is required.', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),


  (713, 'QCA', 615, 'Erosion and sediment must be effectively controlled on the mine site. Sediment laden water must be suitably contained on the mine site and not be allowed access to any watercourse.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (714, 'QCA', 615, 'Water which flows from disturbed areas must be collected and diverted into settling ponds, unless water is effectively exfiltrating.', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (715, 'QCA', 615, 'Inspections must be conducted at stream crossings, contact and non-contact water management structures, snow dumps, and the tailings rock storage facility during rain events and the snowmelt period on the mine site. Where excessive sediment laden runoff is observed, remedial action must be immediately implemented.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),
  (716, 'QCA', 615, 'Any significant releases of sediment-laden water, defined as an unauthorized discharge to the receiving environment, must be appropriately characterized with respect to extent and loading, and reported to the Chief Inspector at [Regional Mines Office e-mail Inbox] within [28 days] of discovery.', 'ELC', 'CON', 4, 'system-mds', 'system-mds'),

  (717, 'QCA', 716, 'Characterization of unauthorized discharges of sediment-laden run-off must include, at a minimum, flow, total suspended solids, turbidity, pH, conductivity, temperature, dissolved oxygen, and total and dissolved metals, of both the effluent and the receiving water.', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),

  (718, 'QCA', 616, 'Water Management, Monitoring and Reporting', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (719, 'QCA', 617, 'Condition of the Land', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (720, 'QCA', 719, 'All equipment brought on to the site must be removed from the project area when the site is not active.', 'ELC', 'LIS', 1, 'system-mds', 'system-mds'),
  (721, 'QCA', 719, 'Derelict or damaged equipment, supplies, or materials must not be stored or otherwise left or abandoned anywhere on the mine site.', 'ELC', 'LIS', 2, 'system-mds', 'system-mds'),
  (722, 'QCA', 719, 'When the site is not active, disturbed areas are to be left in a condition that is neat, clean and safe.', 'ELC', 'LIS', 3, 'system-mds', 'system-mds'),
 
    -- RECLAMATION AND CLOSURE PROGRAM CONDITIONS/LIST-ITEMS/CONDITIONS
  (723, 'QCA', 618, 'The Permittee must maintain with the Minister of Finance security in the amount of [X dollars] $<<bond_amt>>.', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (724, 'QCA', 723, 'The Permittee must deposit the security in accordance with the following installment schedule:', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),

  (725, 'QCA', 724, 'Prior to the mobilization of heavy equipment to the site for the purposes of construction of <<description of activity>>: <<$Dollar amount>> for a subtotal of <<$Dollar Amount>>; and', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (726, 'QCA', 724, 'Within <<Enter time>> months following the start of construction of <<description of activity>>: <<$Dollar Amount>> for a total of <<$Dollar Amount>>.', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),

  (727, 'QCA', 619, 'Reclamation of the surface of the land affected by the operations must be conducted in accordance with the approved work program. The surface of the land and watercourses must be reclaimed to the following end land use:  <<land_use>>;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),

  (728, 'QCA', 620, 'All available topsoil, overburden, and organic material including large woody debris in the disturbance footprint must be salvaged and stockpiled for use in reclamation.', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (729, 'QCA', 620, 'All stockpiled topsoil, overburden, and organic material including large woody debris must be protected from erosion, degradation, and contamination.', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (730, 'QCA', 620, 'All stockpiles must be clearly marked to ensure that they are protected during construction and mine operations.', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),
  (731, 'QCA', 620, 'Stripped and stockpiled soil suitable for use in reclamation must not be used as fill.', 'RCC', 'CON', 4, 'system-mds', 'system-mds'),
  (732, 'QCA', 620, 'Topsoil must not be removed from the mine site unless authorized in writing by an Inspector.', 'RCC', 'CON', 5, 'system-mds', 'system-mds'),
  (733, 'QCA', 620, 'Progressive reclamation must be conducted whenever practicable. Reclamation activities must include:', 'RCC', 'CON', 6, 'system-mds', 'system-mds'),

  (734, 'QCA', 733, 'Compacted surfaces must be de-compacted to allow water infiltration and achieve self-staining vegetation.', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (735, 'QCA', 733, 'Salvaged soil material must:', 'RCC', 'LIS', 2, 'system-mds', 'system-mds'),

  (736, 'QCA', 735, 'be replaced on disturbed areas to pre-disturbance depth;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (737, 'QCA', 735, 'be treated with a rough and loose site preparation where practicable;', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (738, 'QCA', 735, 'be keyed into the underlying materials such that they do not slump off or become unstable;', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),
  (739, 'QCA', 735, 'incorporate roots, stumps and other woody debris to reduce erosion and create greater biological diversity; and', 'RCC', 'CON', 4, 'system-mds', 'system-mds'),
  (740, 'QCA', 735, 'be re-vegetated promptly to a self-sustaining state using appropriate and/or native plant species that support approved end land use.', 'RCC', 'CON', 5, 'system-mds', 'system-mds'),

  (741, 'QCA', 621, 'Individual roads and trails will be exempted from the requirement for total reclamation if either:', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (742, 'QCA', 741, 'The Permittee can demonstrate that an agency of the Crown has accepted responsibility in writing for the operation, maintenance and reclamation of the road or trail; or', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (743, 'QCA', 741, 'The Permittee can demonstrate that another party has a valid authorization from a relevant provincial authority to assume liability for the road.', 'RCC', 'LIS', 2, 'system-mds', 'system-mds')
on conflict do nothing;