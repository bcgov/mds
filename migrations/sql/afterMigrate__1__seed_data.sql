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
    ('C', 'Closed', 20, 'system-mds', 'system-mds')
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
    ('HSM', 'Health and Safety Manager', 111, 'system-mds', 'system-mds', 'true', 'false', 2)
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
    ('placer_operation', 'Placer Opertations', 'system-mds', 'system-mds')
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
    create_user,
    update_user
    )
VALUES 
    ('VER', 'Verification', 'system-mds', 'system-mds'),
    ('REV', 'Technical Review', 'system-mds', 'system-mds'),
    ('REF', 'Referral / Consultation', 'system-mds', 'system-mds'),
    ('DEC', 'Decision', 'system-mds', 'system-mds')
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
(now_application_document_type_code, description, active_ind, create_user, update_user)
VALUES
	('ANS', 'Annual Summary', true, 'system-mds', 'system-mds'),
	('ACP', 'Archaeological Chance Find Procedure', true, 'system-mds', 'system-mds'),
	('BLP', 'Blasting Procedure', true, 'system-mds', 'system-mds'),
	('EMS', 'Explosives Magazine Storage and Use Permit Application', true, 'system-mds', 'system-mds'),
	('LAL', 'Landowner Authorization Letter', true, 'system-mds', 'system-mds'),
	('MRP', 'Mine Emergency Response Plan', true, 'system-mds', 'system-mds'),
	('OTH', 'Other', true, 'system-mds', 'system-mds'),
	('RFE', 'Record of First Nations Engagement', true, 'system-mds', 'system-mds'),
	('TAL', 'Tenure Authorization Letter', true, 'system-mds', 'system-mds'),
	('TMP', 'Tenure Map / Property Map', true, 'system-mds', 'system-mds'),
	('MPW', 'Map of Proposed Work', true, 'system-mds', 'system-mds'),
    ('REV', 'Review',true,'system-mds','system-mds'),
    ('PUB', 'Public Comment',true,'system-mds','system-mds'),
    ('CAL', 'Acknowledgement Letter', true, 'system-mds', 'system-mds'),
	('WDL', 'Withdrawl Letter', true, 'system-mds', 'system-mds'),
	('RJL', 'Rejection Letter', true, 'system-mds', 'system-mds'),
    ('SCD', 'Security Calculation Document', true, 'system-mds', 'system-mds'),
    ('PMT','Working Permit', true, 'system-mds','system-mds'),
    ('PMA','Working Permit for Amendment', true, 'system-mds','system-mds')
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
    ('PUB', 'Public Comment', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


-- Mine Report Definitions have been managed by sequential migrations. 
-- V2019.07.05.15.01
-- V2019.07.09.16.01
-- V2019.09.28.14.16

INSERT INTO document_template
(document_template_code,form_spec_json, template_file_path, active_ind, create_user, update_user)
VALUES
	('NRL', '' , 'templates/now/Rejection Letter Template (NoW).docx', true, 'system-mds', 'system-mds'),
	('NWL', '' , 'templates/now/Withdrawal Letter Template (NoW).docx', true, 'system-mds', 'system-mds'),
	('NCL', '', 'templates/now/Acknowledgment Letter Template (NoW).docx', true, 'system-mds', 'system-mds'),
  ('PMT', '', 'templates/permit/New_Permit_Template.docx', true, 'system-mds','system-mds'),
  ('PMA', '', 'templates/permit/Permit_Amendment_Template.docx', true, 'system-mds','system-mds')
ON CONFLICT DO NOTHING;

UPDATE document_template SET form_spec_json = '[
    {
      "id": "letter_dt",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "mine_no",
      "label": "Mine Number",
      "type": "FIELD",
      "placeholder": "Enter the mine number",
      "required": true,
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s address",
      "required": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s name",
      "required": false
    },
    {
      "id": "property",
      "label": "Property",
      "type": "FIELD",
      "placeholder": "Enter the property",
      "required": true,
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "application_dt",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": null,
      "required": true,
      "relative-data-path": "now_application.submitted_date"
    },
    {
      "id": "inspector",
      "label": "Inspector",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true,
      "relative-data-path": "now_application.lead_inspector.name"
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
      "label": "Regional Office Contact''s Email",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s email",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.email",
      "read-only": true
    },
    {
      "id": "rc_office_phone_number",
      "label": "Regional Office Contact''s Phone Number",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s phone number",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.phone_number",
      "read-only": true
    },
    {
      "id": "rc_office_fax_number",
      "label": "Regional Office Contact''s Fax Number",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s fax number",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.fax_number",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_1",
      "label": "Regional Office Contact''s Mailing Address Line 1",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s mailing address line 1",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_1",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_2",
      "label": "Regional Office Contact''s Mailing Address Line 2",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s mailing address line 2",
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
      "placeholder": null,
      "required": true
    },
    {
      "id": "mine_no",
      "label": "Mine Number",
      "type": "FIELD",
      "placeholder": "Enter the mine number",
      "required": true,
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s address",
      "required": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s name",
      "required": false
    },
    {
      "id": "property",
      "label": "Property",
      "type": "FIELD",
      "placeholder": "Enter the property",
      "required": true,
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "withdrawal_dt",
      "label": "Withdrawal Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "inspector",
      "label": "Inspector",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true,
      "relative-data-path": "now_application.lead_inspector.name"
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
      "label": "Regional Office Contact''s Email",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s email",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.email",
      "read-only": true
    },
    {
      "id": "rc_office_phone_number",
      "label": "Regional Office Contact''s Phone Number",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s phone number",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.phone_number",
      "read-only": true
    },
    {
      "id": "rc_office_fax_number",
      "label": "Regional Office Contact''s Fax Number",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s fax number",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.fax_number",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_1",
      "label": "Regional Office Contact''s Mailing Address Line 1",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s mailing address line 1",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_1",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_2",
      "label": "Regional Office Contact''s Mailing Address Line 2",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s mailing address line 2",
      "required": true,
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
      "placeholder": null,
      "required": true
    },
    {
      "id": "mine_no",
      "label": "Mine Number",
      "type": "FIELD",
      "placeholder": "Enter the mine number",
      "required": true,
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s address",
      "required": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s name",
      "required": false
    },
    {
      "id": "emailed_to",
      "label": "Emailed to",
      "type": "FIELD",
      "placeholder": "Enter the name of the email recipient",
      "required": false
    },
    {
      "id": "property",
      "label": "Property",
      "type": "FIELD",
      "placeholder": "Enter the property",
      "required": true,
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "application_dt",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": null,
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
      "label": "Bond Amount",
      "type": "CURRENCY",
      "placeholder": "Enter the bond amount",
      "required": true
    },
    {
      "id": "inspector",
      "label": "Inspector",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true,
      "relative-data-path": "now_application.lead_inspector.name"
    },
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "You may wish to take the opportunity to post your security at this time to avoid delays in the permitting process.  The security deposit amount has been calculated based on the information provided in your application.  Details for the security deposit calculation are outlined in the attached spreadsheet.  Preferred forms of security are certified cheques, money orders or bank drafts made payable to the Minister of Finance.  Surety Bonds and Irrevocable Standby Letters of Credit (‘ILOC’) are also acceptable.  Please do not send cash.  Ensure you also include a completed and signed `No Interest Payable Form`, which is attached.  ILOCs will only be accepted from the following financial institutions: Bank of Montreal, Bank of Nova Scotia, Canadian Imperial Bank of Commerce, Royal Bank of Canada, Toronto-Dominion Bank.\n\nIn addition, within 30 calendar days of receipt of this letter and prior to issuance of a permit, you must provide to this office:  A Chance Find Procedure (‘CFP’) for archaeological sites, an invasive plant species management plan and an updated Mine Emergency Response Plan (‘MERP’).  Guidelines and best management practices have been attached to this letter to assist with the preparation of the aforementioned items.\n\nThe introduction and spread of invasive plants is a concern throughout the area.  The provincial Invasive Alien Plant Program (https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/invasive-species/iapp) should be reviewed to determine what invasive species have been documented in and around the proposed work site(s).  Best management practices should be applied during operations and an invasive plant management strategy developed.  The attached best practices document has been developed by the Invasive Species Council of British Columbia for forestry operations, but the operational guidelines describe in it can be extended to mineral exploration operations.  For example, ensure incoming and outgoing vehicles are free of weed seeds and plant parts, report observations of infestation and re-vegetate disturbed areas as soon after disturbance.  For more information on individual species visit the Ministry of Agriculture site www.weedsbc.ca or the Invasive Species Council of BC website at www.bcinvasives.ca and go to `resources`.\n\nThe MERP shall include a section which outlines how engagement with affected communities and First Nations will occur in case of an emergency at your mine site.  The MERP is required to be posted at the work site at all times, which must include the name of the designated Mine Manager.  All employees must be advised and trained in the use of this plan.\n\nOther legislation may be applicable to the operation and you (the Permittee) may be required to obtain approvals or permits under that legislation.  It is your responsibility to comply with the terms and conditions of all other permits and authorizations which you may have been issued and other applicable legislation including, but not limited to the: Wildlife Act, Wildfire Act, Wildfire Regulation and the Water Sustainability Act.",
      "required": true
    },
    {
      "id": "rc_office_email",
      "label": "Regional Office Contact''s Email",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s email",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.email",
      "read-only": true
    },
    {
      "id": "rc_office_phone_number",
      "label": "Regional Office Contact''s Phone Number",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s phone number",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.phone_number",
      "read-only": true
    },
    {
      "id": "rc_office_fax_number",
      "label": "Regional Office Contact''s Fax Number",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s fax number",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.fax_number",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_1",
      "label": "Regional Office Contact''s Mailing Address Line 1",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s mailing address line 1",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_1",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_2",
      "label": "Regional Office Contact''s Mailing Address Line 2",
      "type": "FIELD",
      "placeholder": "Enter the regional office contact''s mailing address line 2",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_2",
      "read-only": true
    }
  ]'
where document_template_code = 'NCL';

--THE FRONTEND DOESN"T ACTUALLY USE THE SPEC TO MAKE THE FORM,
--but we need data enforcement still. 
UPDATE document_template SET form_spec_json = '[
    {
      "id": "mine_no",
      "label": "Mine Number",
      "type": "FIELD",
      "placeholder": "Enter the mine number",
      "required": true,
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "permittee",
      "label": "Permittee Name",
      "type": "FIELD",
      "placeholder": "Enter the permittee''s name",
      "relative-data-path": "now_application.permittee_name",
      "read-only": true
    },
    {
      "id": "property",
      "label": "Property",
      "type": "FIELD",
      "placeholder": "Enter the property",
      "required": true,
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "lead_inspector",
      "label": "Lead Inspector",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true,
      "relative-data-path": "now_application.lead_inspector.name",
      "read-only": true
    },
    {
      "id": "application_date",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": "Enter the inspector''s name",
      "required": true,
      "relative-data-path": "now_application.submitted_date",
      "read-only": true
    },
    {
      "id": "application_type",
      "label": "Application Type",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true,
      "relative-data-path": "now_application.notice_of_work_type.description",
      "read-only": true
    }
  ]'
where document_template_code = 'PMT';

UPDATE document_template SET form_spec_json = '[
    {
      "id": "mine_no",
      "label": "Mine Number",
      "type": "FIELD",
      "placeholder": "Enter the mine number",
      "required": true,
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "permittee",
      "label": "Permittee Name",
      "type": "FIELD",
      "placeholder": "Enter the permittee''s name",
      "relative-data-path": "now_application.permittee_name",
      "read-only": true
    },
    {
      "id": "property",
      "label": "Property",
      "type": "FIELD",
      "placeholder": "Enter the property",
      "required": true,
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "lead_inspector",
      "label": "Lead Inspector",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true,
      "relative-data-path": "now_application.lead_inspector.name",
      "read-only": true
    },
    {
      "id": "application_date",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": "Enter the inspector''s name",
      "required": true,
      "relative-data-path": "now_application.submitted_date",
      "read-only": true
    },
    {
      "id": "application_type",
      "label": "Application Type",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true,
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
SET document_template_code = 'PMT'
where now_application_document_type_code = 'PMT';

UPDATE now_application_document_type
SET document_template_code = 'PMA'
where now_application_document_type_code = 'PMA';

-- UPDATE now_application_document_type
-- SET document_template_code = 'PMA'
-- where now_application_document_type_code = 'PMA';


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
    ('ILC', 'Irrevocable Letter of Credit', 'system-mds', 'system-mds'),
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
    ('NIA', 'No Interest Acknowledgement Form', true, 'system-mds', 'system-mds', 60),
    ('RSF', 'Release of Security Form', true, 'system-mds', 'system-mds', 70),
    ('RSL', 'Release of Security Letter', true, 'system-mds', 'system-mds', 80),
    ('REL', 'Reminder Letter', false, 'system-mds', 'system-mds', 90),
    ('SRB', 'Scan of Reclamation Security Document', true, 'system-mds', 'system-mds', 100),
    ('SIB', 'Security Instructions for Bank', true, 'system-mds', 'system-mds', 110)
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
(condition_category_code, description, active_ind, display_order, create_user, update_user)
VALUES
	('GEC', 'General Conditions', true, 10, 'system-mds', 'system-mds'),
	('HSC', 'Health and Safety Conditions', true, 20, 'system-mds', 'system-mds'),
	('GOC', 'Geotechnical Conditions', true, 30, 'system-mds', 'system-mds'),
	('ELC', 'Environmental Land and Watercourses Conditions', true, 40, 'system-mds', 'system-mds'),
  ('RCC', 'Reclamation and Closure Program Conditions', true, 50, 'system-mds', 'system-mds'),
	('ADC', 'Additional Conditions', true, 60, 'system-mds', 'system-mds')
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
	(1, 'SAG', 'Compliance with Mines Act and Code', 'GEC', 'SEC', 1, 'system-mds', 'system-mds'),
	(2, 'SAG', 'Changes to Permitted Activities and Amendment of the Permit', 'GEC', 'SEC', 2, 'system-mds', 'system-mds'),
	(3, 'SAG', 'Permit Approval', 'GEC', 'SEC', 3, 'system-mds', 'system-mds'),
  (4, 'SAG', 'Permit', 'GEC', 'SEC', 4, 'system-mds', 'system-mds'),
	(5, 'SAG', 'Mine Closure', 'GEC', 'SEC', 5, 'system-mds', 'system-mds'),
	(6, 'SAG', 'Documentation', 'GEC', 'SEC', 6, 'system-mds', 'system-mds'),

  (7, 'SAG', 'Mine Emergency Response Plan', 'HSC', 'SEC', 1, 'system-mds', 'system-mds'),
	(8, 'SAG', 'Fuels and Lubricant Handling, Transportation and Storage', 'HSC', 'SEC', 2, 'system-mds', 'system-mds'),

  (9, 'SAG', 'Site Stability', 'GOC', 'SEC', 1, 'system-mds', 'system-mds'),

  (10, 'SAG', 'Cultural Heritage and Resources Protection', 'ELC', 'SEC', 1, 'system-mds', 'system-mds'),
  (11, 'SAG', 'Management of Invasive Species', 'ELC', 'SEC', 2, 'system-mds', 'system-mds'),

	(12, 'SAG', 'Security', 'RCC', 'SEC', 1, 'system-mds', 'system-mds'),
	(13, 'SAG', 'Obligation to Reclaim', 'RCC', 'SEC', 2, 'system-mds', 'system-mds'),
	(14, 'SAG', 'Watercourses and Aquatic Ecosystem Protection', 'RCC', 'SEC', 3, 'system-mds', 'system-mds'),
  (15, 'SAG', 'Roads', 'RCC', 'SEC', 4, 'system-mds', 'system-mds')
on conflict do nothing;



INSERT INTO standard_permit_conditions
(standard_permit_condition_id, notice_of_work_type, parent_standard_permit_condition_id, condition, condition_category_code, condition_type_code, display_order, create_user, update_user)
VALUES

	(16, 'SAG', 1, 'The Permittee shall ensure that all work is in compliance with all sections and parts of the Mines Act and the Health, Safety and Reclamation Code for Mines in B.C. (Code), and the Permittee shall obey all orders issued by the Chief Inspector or the Chief Inspector’s delegate.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),

  (17, 'SAG', 2, 'The owner, agent or manager (herein called the Permittee) shall notify the Chief Inspector in writing of any intention to depart from the approved Application and this Mines Act permit <<permit_no>> to any substantial degree, and shall not proceed to implement the proposed changes without the written authorization of the Chief Inspector or their delegate', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (18, 'SAG', 2, 'The Chief Inspector reserves the right to amend the conditions set forth in Mines Act permit <<permit_no>>', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),

  (19, 'SAG', 3, 'Write out activities and total disturbance as indicated in the Notice of Work application (that you approve of – you must specify activities that were applied for that you do not approve of if there are any)', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (20, 'SAG', 3, 'A Maximum Annual Produced Tonnage of <<annual_tonnes>>', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),
  (21, 'SAG', 3, 'This permit approval is valid until <<expiry_dt>>', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),

  (22, 'SAG', 4, 'This Permit is not transferable or assignable.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),

  (23, 'SAG', 5, 'If the Operations cease for a period longer than one (1) year the Permittee shall either continue to carry out the conditions of the permit or apply for an amendment setting out a revised program for approval by the Chief Inspector.', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),

  (24, 'SAG', 6, 'While they remain valid and subsisting, both this Permit and appropriate and up-to-date documentation (including maps of the subject mining property) must be kept at the subject mining property, and must be available to authorized Inspectors and other authorized government officials upon request;', 'GEC', 'CON', 1, 'system-mds', 'system-mds'),
  (25, 'SAG', 6, 'Annual reports shall be submitted in a form and containing the information specified by the Chief Inspector as required', 'GEC', 'CON', 2, 'system-mds', 'system-mds'),
  (26, 'SAG', 6, 'The permittee shall submit an updated Mine Plan and Notice of Work prior to the expiry of approval <<approval_no>> on <<expiry_dt>>.', 'GEC', 'CON', 3, 'system-mds', 'system-mds'),

	(27, 'SAG', 7, 'The Mine Emergency Response Plan (‘MERP’) dated <<document_merp_date>> must be implemented prior to commencement. In addition to addressing daily operational issues, the plan shall specifically address emergency evacuation of personnel due to injury and forest fire hazard. All persons employed or visiting on the mine site shall be trained with the MERP. The plan shall be available on site for review upon request and must be updated as changes arise.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),

  (28, 'SAG', 8, 'Fuels and Lubricants, if stored on the mine site, shall conform to the requirements of the document:  A Field Guide to Fuel Handling, Transportation and Storage, 3rd Edition, February 2002. Ministry of Water, Land and Air Protection and the Forest Service British Columbia.', 'HSC', 'CON', 1, 'system-mds', 'system-mds'),
  (29, 'SAG', 8, 'The Permittee shall develop and implement a hydrocarbon management plan upon commencement of work that deals with fueling, operational servicing, spill prevention and clean-up for fuels and lubricants stored on the mine site. The plan shall be made available to the Chief Inspector upon request and shall account for the following at minimum:', 'HSC', 'CON', 2, 'system-mds', 'system-mds'),

  (30, 'SAG', 29, 'Fuel and lubricants shall be delivered to site as needed to re-supply fuel and oil tanks on mobile and fixed equipment;', 'HSC', 'LIS', 1, 'system-mds', 'system-mds'),
  (31, 'SAG', 29, 'Impermeable, oil absorbent matting shall be used when refueling and servicing equipment;', 'HSC', 'LIS', 2, 'system-mds', 'system-mds'),
  (32, 'SAG', 29, 'While refueling the operator shall be in control of the refueling nozzle at all times;', 'HSC', 'LIS', 3, 'system-mds', 'system-mds'),
  (33, 'SAG', 29, 'If any petroleum, hydrocarbon or other product (no matter how small) is spilled the contaminated soil/gravels shall be forthwith collected and removed for appropriate disposal;', 'HSC', 'LIS', 4, 'system-mds', 'system-mds'),
  (34, 'SAG', 29, 'Fuel or oil leaks on equipment shall be effectively repaired as soon as they are discovered, or the equipment shall be removed from the site and not operated until repairs have been made;', 'HSC', 'LIS', 5, 'system-mds', 'system-mds'),
  (35, 'SAG', 29, 'An emergency spill containment and clean up kit shall be maintained at the site while it is in operation. The kit shall have the capacity to contain and clean up 100% of a spill from a failure of the largest volume of a fuel or lubricant tank or system plus 10%. Secondary containment must be utilized on all stationary equipment with fuel storage capacity (e.g., Pumps).', 'HSC', 'LIS', 6, 'system-mds', 'system-mds'),


  (36, 'SAG', 9, 'The Chief Inspector shall be advised in writing at the earliest opportunity of any unforeseen conditions that could adversely affect the extraction of materials, site stability, erosion control or the reclamation of the site;', 'GOC', 'CON', 1, 'system-mds', 'system-mds'),
  (37, 'SAG', 9, 'The stability of the slopes shall be maintained at all times and erosion shall be controlled at all times (as described in <<document>> – updated as required if there is a sediment and erosion control plan – or remove reference to document);', 'GOC', 'CON', 2, 'system-mds', 'system-mds'),
  (38, 'SAG', 9, 'The discovery of any significant subsurface flows of water, seeps, substantial amounts of fine textured, soils, silts and clays, as well as significant adverse geological conditions shall be reported to the Chief Inspector as soon as possible and work shall cease until written approval from the Chief Inspector advises otherwise.', 'GOC', 'CON', 3, 'system-mds', 'system-mds'),

  (39, 'SAG', 10, 'The Archaeological Chance Find Procedure (‘CFP’) <<document_CFP>>, must be implemented prior to commencement of work.  All persons employed or visiting on the mine site shall be trained with the CFP.  The plan shall be available on site for review upon request and must be updated as changes arise.', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),

  (40, 'SAG', 11, 'Prior to commencement of work, the Permittee must develop an Invasive Species Management Plan and submit the plan to MMD-Cranbrook@gov.bc.ca', 'ELC', 'CON', 1, 'system-mds', 'system-mds'),
  (41, 'SAG', 11, 'The Invasive Species Management Plan must be implemented on commencement of work for the duration of the authorization;', 'ELC', 'CON', 2, 'system-mds', 'system-mds'),
  (42, 'SAG', 11, 'Occurrences of invasive species must be reported through the Provincial online reporting system.', 'ELC', 'CON', 3, 'system-mds', 'system-mds'),



  (43, 'SAG', 12, 'The Permittee shall maintain with the Minister of Finance security in the amount of <<X dollars>> ($<<bond_amt>>).  The security will be held by the Minister of Finance and for the proper performance of the approved program and all the conditions of this permit in a manner satisfactory to the Chief Inspector.', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),

  (44, 'SAG', 13, 'The surface of the land and watercourses shall be reclaimed to the following end land use:  <<land_use>>;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (45, 'SAG', 13, 'Excluding lands that are not to be reclaimed, the average land capability to be achieved on the remaining lands shall not be less than the average that existed prior to mining, unless the land capability is not consistent with the approved end land use;', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (46, 'SAG', 13, 'Land shall be re-vegetated to a self-sustaining state using a certified native seed mix appropriate for the local BEC zone <<zone>>;', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),
  (47, 'SAG', 13, 'On all lands to be revegetated, the growth medium shall satisfy land use, productivity, and water quality objectives.  Topsoil and overburden (to rooting depth) shall be removed from operational areas prior to any disturbance of the land and stockpiled separately on the property for use in reclamation programs, unless the Permittee can provide evidence which demonstrates, to the satisfaction of the Chief Inspector, that reclamation objectives can otherwise be achieved;', 'RCC', 'CON', 4, 'system-mds', 'system-mds'),
  (48, 'SAG', 13, 'The Permittee shall undertake monitoring programs, as required by the Chief Inspector, to demonstrate that reclamation objectives are being achieved.', 'RCC', 'CON', 5, 'system-mds', 'system-mds'),

  (49, 'SAG', 14, 'Water which flows from disturbed areas shall be collected and diverted into settling ponds, unless water is effectively ex-filtrating through gravels;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (50, 'SAG', 14, 'All water pumps used within fish-bearing streams are to be fitted with screens to prevent fish entrainment that meet the requirements of the Department of Fisheries and Oceans Freshwater Intake End-of-Pipe Fish Screen Guideline.', 'RCC', 'CON', 2, 'system-mds', 'system-mds'),
  (51, 'SAG', 14, '<<Works in and about a stream conditions from template.>>', 'RCC', 'CON', 3, 'system-mds', 'system-mds'),

  (52, 'SAG', 15, 'All roads shall be reclaimed in accordance with land use objectives unless permanent access is required to be maintained;', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),
  (53, 'SAG', 15, 'Individual roads will be exempted from the requirement for total reclamation under condition 4(a) if either:', 'RCC', 'CON', 1, 'system-mds', 'system-mds'),

  (54, 'SAG', 53, 'The Permittee can demonstrate that an agency of the Crown has explicitly accepted responsibility for the operation, maintenance and ultimate deactivation and abandonment of the road; or', 'RCC', 'LIS', 1, 'system-mds', 'system-mds'),
  (55, 'SAG', 53, 'The Permittee can demonstrate that another private party has explicitly agreed to accept responsibility for the operation, maintenance and ultimate deactivation and abandonment of the road and has, in this regard, agreed to comply with all the terms and conditions, including bonding provisions, of this reclamation permit, and to comply with all other relevant provincial government (and federal government) regulatory requirements.', 'RCC', 'LIS', 2, 'system-mds', 'system-mds')                                                                                   
on conflict do nothing;
