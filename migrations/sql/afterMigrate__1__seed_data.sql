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
    ('BCL', 'Public Land', TRUE, 'system-mds', 'system-mds'),
    ('PRL', 'Private Land', TRUE, 'system-mds', 'system-mds')
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
    ('SA','BCL'),
    ('CG','PRL'),
    ('SA','PRL')
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
    ('SUR', 'PRL'),
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
    ('INI', 'Initial Document', TRUE,  'system-mds', 'system-mds'),
    ('INM', 'Internal Ministry Document', TRUE,  'system-mds', 'system-mds')
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
	('MEC', 'm³', 'Meters cubed', true, 'system-mds', 'system-mds'),
	('HA', 'ha', 'Hectares', true, 'system-mds', 'system-mds'),
	('DEG',  'deg', 'Degrees', true, 'system-mds', 'system-mds'),
  ('PER', '%', 'Grade (Percent)', true, 'system-mds', 'system-mds'),
	('MTR', 'm', 'Meters', true, 'system-mds', 'system-mds'),
  ('KMT', 'km', 'Kilometer ', true, 'system-mds', 'system-mds'),
  ('MES', 'm³/s', 'Meters cubed/s', true, 'system-mds', 'system-mds'),
  ('MED', 'm³/day', 'Meters cubed/day', true, 'system-mds', 'system-mds'),
  ('MEY', 'm³/year', 'Meters cubed/year', true, 'system-mds', 'system-mds')
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
	('CDI', 'Client Delayed', 30, true, 'system-mds', 'system-mds'),
  ('GVD', 'Govt. Action Required', 60, true, 'system-mds', 'system-mds'),
  ('AIA', 'Approved', 10, true, 'system-mds', 'system-mds'),
	('REJ', 'Rejected', 80, true, 'system-mds', 'system-mds'),
  ('REC', 'Received', 90, true, 'system-mds', 'system-mds'),
  ('PAP', 'Pending Approval', 50, false, 'system-mds', 'system-mds'),
	('REI', 'Rejected-Initial', 100, false, 'system-mds', 'system-mds'),
	('PCO', 'Permit Closed', 40, false, 'system-mds', 'system-mds'),
	('NPR', 'No Permit Required', 110, true, 'system-mds', 'system-mds'),
	('RCO', 'Referral Complete', 120, true, 'system-mds', 'system-mds'),
  ('PEV', 'Pending Verification', 130, true, 'system-mds', 'system-mds'),
  ('WDN', 'Withdrawn', 140, true, 'system-mds', 'system-mds')
on conflict do nothing;

INSERT INTO mine_incident_category
(mine_incident_category_code, description, active_ind, create_user, update_user, display_order, is_historic)
VALUES
	('H&S', 'Health and Safety', true, 'system-mds', 'system-mds', 30, TRUE),
	('GTC', 'Geotechnical', true, 'system-mds', 'system-mds', 20, TRUE),
	('ENV', 'Environmental', true, 'system-mds', 'system-mds', 10, TRUE),
    ('SPI', 'Spill', true, 'system-mds', 'system-mds', 40, TRUE)
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
    ('ANS', 'Annual Summary', true, 'AAF', 'system-mds', 'system-mds'),
    ('ACP', 'Archaeological Chance Find Procedure', true, 'AAF', 'system-mds', 'system-mds'),
    ('BLP', 'Blasting Procedure', true, 'AAF', 'system-mds', 'system-mds'),
    ('EMS', 'Explosives Magazine Storage and Use Permit Application', true, 'AAF', 'system-mds', 'system-mds'),
    ('LAL', 'Landowner Authorization Letter', true, 'AAF', 'system-mds', 'system-mds'),
    ('MRP', 'Mine Emergency Response Plan', true, 'AAF', 'system-mds', 'system-mds'),
    ('OTA', 'Other', true, 'AAF', 'system-mds', 'system-mds'),
    ('OTH', 'Other', true, 'GDO', 'system-mds', 'system-mds'),
    ('RFE', 'Record of First Nations Engagement', true, 'AAF', 'system-mds', 'system-mds'),
    ('TAL', 'Tenure Authorization Letter', true, 'AAF', 'system-mds', 'system-mds'),
    ('REV', 'Review', true, 'GDO', 'system-mds','system-mds'),
    ('CAL', 'Acknowledgement Letter', true, 'GDO', 'system-mds', 'system-mds'),
    ('WDL', 'Withdrawl Letter', true, 'GDO', 'system-mds', 'system-mds'),
    ('RJL', 'Rejection Letter', true, 'GDO', 'system-mds', 'system-mds'),
    ('PMT','Working Permit', true, 'AEF', 'system-mds','system-mds'),
    ('PMA','Working Permit for Amendment', true, 'AEF', 'system-mds','system-mds'),
    ('SRB', 'Scan of Reclamation Security Document', true, 'SDO', 'system-mds','system-mds'),
    ('NIA', 'No Interest Acknowledgement Form', true, 'SDO', 'system-mds','system-mds'),
    ('AKL', 'Acknowledgement of Security Letter', true, 'SDO', 'system-mds','system-mds'),
    ('SCD', 'Bond Calculator', true, 'SDO', 'system-mds', 'system-mds'),
    ('TMP', 'Title/Tenure Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('MPW', 'Proposed and/or Permitted Mine Area Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('MPG', 'Proposed and/or Permitted Mine Area Map', true, 'GDO', 'system-mds', 'system-mds'),
    ('LMA', 'Location Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('LTM', 'Land Title/Licence of Occupation Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('OMA', 'Overview Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('SMA', 'Supplemental Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('SSF', 'Submitted Shape Files', true, 'MDO', 'system-mds', 'system-mds'),
    ('CSL', 'Cross-sectional/Longitudinal', true, 'MDO', 'system-mds', 'system-mds'),
    ('PFR', 'Preliminary Field Reconnaissance', true, 'AAF', 'system-mds', 'system-mds'),
    ('AOA', 'Archaeological Overview Assessment', true, 'AAF', 'system-mds', 'system-mds'),
    ('AIA', 'Archaeological Impact Assessment', true, 'AAF', 'system-mds', 'system-mds'),
    ('SOP', 'Standard/Safe Operating Procedures', true, 'AAF', 'system-mds', 'system-mds'),
    ('RSP', 'Riparian Setbacks Plan', true, 'AAF', 'system-mds', 'system-mds'),
    ('WMP', 'Water Management Plan', true, 'AAF', 'system-mds', 'system-mds'),
    ('WPL', 'Wildlife Management Plan', true, 'AAF', 'system-mds', 'system-mds'),
    ('RPL', 'Reclamation Plan', true, 'AAF', 'system-mds', 'system-mds'),
    ('OMP', 'Other Management Plan', true, 'AAF', 'system-mds', 'system-mds'),
    ('SEP', 'Sediment and Erosion Control Plan', true, 'AAF', 'system-mds', 'system-mds'),
    ('FDP', 'Fugitive Dust Management Plan', true, 'AAF', 'system-mds', 'system-mds'),
    ('VMP', 'Vegetation Management Plan', true, 'AAF', 'system-mds', 'system-mds'),
    ('TSS', 'Terrain Stability Study', true, 'AAF', 'system-mds', 'system-mds'),
    ('MAD', 'Metal Leaching/Acid Rock Drainage', true, 'AAF', 'system-mds', 'system-mds'),
    ('LNO', 'Landowner Notification', true, 'AAF', 'system-mds', 'system-mds'),
    ('DWP', 'Description of Work/Work Program', true, 'AAF', 'system-mds', 'system-mds'),
    ('ARE', 'Agent Letter of Representation', true, 'AAF', 'system-mds', 'system-mds'),
    ('SRE', 'Status Report', true, 'GDO', 'system-mds', 'system-mds'),
    ('SOM', 'Status Report - Overlapping Interests Maps', true, 'GDO', 'system-mds', 'system-mds'),
    ('SRS', 'Status Report - Shape Files', true, 'GDO', 'system-mds', 'system-mds'),
    ('ECC', 'Email Correspondence/Communications', true, 'GDO', 'system-mds', 'system-mds'),
    ('RMI', 'Request for More Information', true, 'GDO', 'system-mds', 'system-mds'),
    ('WFI', '30 day Warning for Information', true, 'GDO', 'system-mds', 'system-mds'),
    ('NPR', 'No Permit Required', true, 'GDO', 'system-mds', 'system-mds'),
    ('NPI', 'No Permit Required IP', true, 'GDO', 'system-mds', 'system-mds'),
    ('WFS', '30 day Warning for Security', true, 'SDO', 'system-mds', 'system-mds'),
    ('NPE', 'Permit Enclosed Letter', true, 'GDO', 'system-mds', 'system-mds'),
    ('RFD', 'Reasons for Decision', true, 'GDO', 'system-mds', 'system-mds'),
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
    ('PCM', 'Ministry Response', true, 'PDO', 'system-mds', 'system-mds'),
    ('AMR', 'Amendment Request', true, 'AAF', 'system-mds', 'system-mds'),
    ('MYA', 'MYAB Update Form', true, 'AAF', 'system-mds', 'system-mds'),
    ('SUD', 'Supporting Documents', true, 'AAF', 'system-mds', 'system-mds')
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
(document_template_code, form_spec_json, template_file_path, active_ind, create_user, update_user, source_model_name)
VALUES
  ('NRL', '' , 'templates/now/Rejection Letter.docx', true, 'system-mds', 'system-mds', 'NOWApplicationIdentity'),
  ('NWL', '' , 'templates/now/Withdrawal Letter.docx', true, 'system-mds', 'system-mds', 'NOWApplicationIdentity'),
  ('NCL', '', 'templates/now/Acknowledgment Letter.docx', true, 'system-mds', 'system-mds', 'NOWApplicationIdentity'),
  ('NPE', '', 'templates/now/Permit Enclosed Letter.docx', true, 'system-mds', 'system-mds', 'NOWApplicationIdentity'),
  ('NTR', '[]', 'templates/now/Notice of Work Form.docx', true, 'system-mds', 'system-mds', 'NOWApplicationIdentity'),
  ('PMT', '[]', 'templates/permit/Permit.docx', true, 'system-mds', 'system-mds', 'NOWApplicationIdentity'),
  ('PMA', '[]', 'templates/permit/Permit.docx', true, 'system-mds', 'system-mds', 'NOWApplicationIdentity'),
  ('ESL', '', 'templates/explosives_permit/Explosives Storage and Use Permit Enclosed Letter.docx', true, 'system-mds', 'system-mds', 'ExplosivesPermit'),
  ('ESP', '', 'templates/explosives_permit/Explosives Storage and Use Permit.docx', true, 'system-mds', 'system-mds', 'ExplosivesPermit')
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
      "id": "application_dt_label",
      "type": "LABEL",
	  "context-value": "This letter acknowledges receipt of your Notice of Work and Reclamation Program dated"
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
      "id": "exploration_type_label",
      "type": "LABEL",
	  "context-value": "Your proposed program of"
	},
    {
      "id": "exploration_type",
      "label": "Exploration Type",
      "type": "FIELD",
      "placeholder": "Enter the exploration type",
      "required": true
    },
	{ 
      "id": "bond_inc_amt_label",
      "type": "LABEL",
	  "context-value": "has been referred to other resource agencies and has been sent to Indigenous Nations for consultation. Prior to the approval and issuance of your permit, you are required to post a security deposit of"
	},
    {
      "id": "bond_inc_amt",
      "label": "Bond Increase Amount",
      "type": "CURRENCY",
      "placeholder": "Enter the bond increase amount",
      "relative-data-path": "now_application.liability_adjustment"
    },
	{ 
      "id": "letter_body_label",
      "type": "LABEL",
	  "context-value": "and you may wish to take the opportunity to post your security at this time to avoid any delays.  Safekeeping Agreements backed by GIC’s may be used for bonds under $25,000 with the enclosed template. Complete the form with your banker, using the ''Instructions on Completing a Safekeeping Agreement'' and return it to this office for our signature.  A copy of the completed form will be returned to you and your financial institution.  Irrevocable Letters of Credit, certified cheque, bank draft or money order made payable to the Minister of Finance, at the undernoted address, are also acceptable. Payments made by EFT can also be arranged. Please do not send cash. For reclamation surety bonds, the bond shall be with a surety licensed to transact the business of a surety in Canada. For the surety bond template and more please visit our Reclamation Security website. Personal information collected by the Ministry of Energy, Mines, and Low Carbon Innovation is under the authority of section 26(c) of the Freedom of Information and Protection of Privacy Act for the purpose of collecting Bond and Securities Data. If you have any questions about the collection, use and disclosure of your personal information, please contact: Mines Digital Services by email at mds@gov.bc.ca, by phone at: 778-698-7233, or by mail at: PO Box 9380, STN PROV GOVT, Victoria, BC, V8W 9M6."
	},
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Other legislation may be applicable to the operation and you (the Permittee) may be required to obtain approvals or permits under that legislation. It is your responsibility to comply with the terms and conditions of all other permits and authorizations which you may have been issued and other applicable legislation including, but not limited to the: Wildlife Act, Wildfire Act, Wildfire Regulation and the Water Sustainability Act.",
      "required": true
    },
	{ 
      "id": "issuing_inspector_name_label",
      "type": "LABEL",
	  "context-value": "You are reminded that no work may commence until you have received your permits. To clarify or discuss any of the above, please call or email me at the information below.\n\nSincerely,"
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
  ]' WHERE document_template_code ='NCL';
  
  

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
      "id": "application_dt_label",
      "type": "LABEL",
	  "context-value": "This letter serves as formal notice that the Notice of Work and Reclamation application dated "
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
      "id": "letter_body_label",
      "type": "LABEL",
	  "context-value": "for the above noted property has been discontinued for the proposed project."
	},
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Future proposals for mining activities on the above noted property will require the submission of a new Notice of Work application. Should you require further information or have questions please do not hesitate to contact me.",
      "required": true
    },
	{ 
      "id": "issuing_inspector_name_label",
      "type": "LABEL",
	  "context-value": "Sincerely,"
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
    },
    {
      "id": "application_type_code",
      "relative-data-path": "now_application.application_type_code",
      "read-only": true
    }
  ]' WHERE document_template_code ='NRL';
  
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
      "id": "application_dt_label",
      "type": "LABEL",
	  "context-value": "Please find enclosed your Mines Act permit, which authorizes exploration activities as detailed in the Notice of Work and Reclamation Program dated"
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
      "id": "letter_body_label",
      "type": "LABEL",
	  "context-value": "The Notice of Work and Reclamation Program form part of your permit, and you are reminded that you may not depart from the permitted program without written authorization."
	},
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Please ensure that you and all persons who are carrying out activities in accordance with this permit comply with all terms and conditions of the permit and are familiar with the permitted work program.\n\nThis permit applies only to the requirements under the Mines Act and Health, Safety and Reclamation Code for Mines in British Columbia (Code).  Other legislation may be applicable to the operation and you (the Permittee) may be required to obtain approvals or permits under that legislation. Examples of other authorizations would be for timber removal, water use, works within the agricultural land reserve etc.\n\nThe amount of your security deposit may be adjusted on the basis of reclamation performance, field inspections by this ministry, and on reports which may be requested.",
      "required": true
    },
	{ 
      "id": "issuing_inspector_name_label",
      "type": "LABEL",
	  "context-value": "Sincerely,"
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
    },
    {
      "id": "application_type_code",
      "relative-data-path": "now_application.application_type_code",
      "read-only": true
    },
    {
      "id": "permit_no",
      "relative-data-path": "now_application.permit.permit_no",
      "read-only": true
    }
  ]' WHERE document_template_code ='NPE';
  
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
      "id": "withdrawal_dt_label",
      "type": "LABEL",
	  "context-value": "I refer to your decision of"
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
      "id": "letter_body_label",
      "type": "LABEL",
	  "context-value": "to withdraw your Notice of Work application and confirm that all further processing of your application has now been terminated."
	},
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "You will have to reapply should you wish to carry out your intended work program. You are reminded that pursuant to Section 10 of the Mines Act no exploration activities can be carried out unless you have received the required permit.",
      "required": true
    },
	{ 
      "id": "issuing_inspector_name_label",
      "type": "LABEL",
	  "context-value": "Sincerely,"
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
    },
    {
      "id": "application_type_code",
      "relative-data-path": "now_application.application_type_code",
      "read-only": true
    }
  ]' WHERE document_template_code ='NWL';

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
      "id": "property",
      "relative-data-path": "now_application.property_name",
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
      "id": "now_num",
      "relative-data-path": "now_application.now_number",
      "read-only": true
    },
    { 
      "id": "application_dt_label",
      "type": "LABEL",
	    "context-value": "I am writing to acknowledge receipt of your Notice of Work dated:"
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
      "id": "application_dt_end_label",
      "type": "LABEL",
	    "context-value": "for an Induced Polarization (IP) survey program."
	  },
    { 
      "id": "start_dt_label",
      "type": "LABEL",
	    "context-value": "Due to the nature of the proposed work, you are exempted under subsection 10 (2) of the Mines Act from the requirement to holda Mines Act permit for the IP survey program described in your Notice of Work application, and as shown on the maps in your Notice of Work, for the exemption period from Start Date "
	  },
    {
      "id": "start_dt",  
      "label": "Application Start Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "relative-data-path": "now_application.proposed_start_date",
      "required": true
    },
    { 
      "id": "end_dt_label",
      "type": "LABEL",
	    "context-value": "to Completion Date"
	  },
    {
      "id": "end_dt",  
      "label": "Application End Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "relative-data-path": "now_application.proposed_end_date",
      "required": true
    },
    { 
      "id": "letter_body_label",
      "type": "LABEL",
	    "context-value": "subject to the following conditions:\n1. You must provide the Inspector written notification of your intent to commence work at least 10 days prior to doing so;\n2. You must provide the Inspector written notice at least 7 days prior to ceasing work on the program;\n3. For work conducted during each year of the exemption period, you must complete an Annual Summary of Exploration Activities which can be found at http://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/annual-reporting-forms, and submit that to the Inspector by March 31 of the following year. \n\nYou are reminded that Part 9.3.5, Induced Polarization Geophysical Systems, of the Health, Safety and Reclamation Code for Mines in British Columbia (the Code) applies to your IP survey program.\n\nPlease note that this exemption applies only to the permit requirement under subsection 10(1) of the Mines Act. All other sections of the Mines Act and the Code continue to apply.  It is your responsibility to comply with all other applicable legislation,and the terms and conditions of all other permits and authorizations which may be required under other legislation.\n\nThe BC Wildfire Management Branch requires all persons carrying out industrial activities between March 1st and November 1st each year, to provide emergency contact information. You can submit this form to the local BC Fire Centre: https://www.for.gov.bc.ca/isb/forms/lib/FS1404.pdf\n\nIf your work plans should change and more intensive exploration is anticipated, please submit another Notice of Work providing the appropriate information.To clarify or discuss any of the above, please call this office.",
      "required": true
	  },
	  { 
      "id": "issuing_inspector_name_label",
      "type": "LABEL",
	    "context-value": "Sincerely,"
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
    },
    {
      "id": "application_type_code",
      "relative-data-path": "now_application.application_type_code",
      "read-only": true
    }
  ]' WHERE document_template_code ='NPI';

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
      "id": "property",
      "relative-data-path": "now_application.property_name",
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
      "id": "application_dt_label",
      "type": "LABEL",
	    "context-value": "I am writing to acknowledge receipt of your Notice of Work dated"
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
      "id": "letter_body_label",
      "type": "LABEL",
	    "context-value": "Due to the nature of the proposed work, a Mines Act permit is not required.  I wish you every success in your endeavor.\n\nPlease note that this applies only to the requirements under the Mines Act and Health, Safety and Reclamation Code for Mines in British Columbia (Code).  Other legislation may be applicable to the operation and you may be required to obtain approvals or permits under that legislation.  It is your responsibility to comply with the terms and conditions of all other permits and authorizations which you may have been issued and other applicable legislation, including the Wildfire Act and Wildfire Regulation.\nIf your work plans should change and more intensive exploration is anticipated, please submit another Notice of Work providing the appropriate information.\n\nTo clarify or discuss any of the above, please call this office.",
      "required": true
	  },
	  { 
      "id": "issuing_inspector_name_label",
      "type": "LABEL",
	    "context-value": "Sincerely,"
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
    },
    {
      "id": "application_type_code",
      "relative-data-path": "now_application.application_type_code",
      "read-only": true
    }
  ]' WHERE document_template_code ='NPR';

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

UPDATE now_application_document_type
SET document_template_code = 'NPR'
where now_application_document_type_code = 'NPR';

UPDATE now_application_document_type
SET document_template_code = 'NPI'
where now_application_document_type_code = 'NPI';

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
    update_user,
    active_ind
    )
VALUES
    ('Y', 'Yes', 10, 'system-mds', 'system-mds', true),
    ('F', 'Ministry of Forests', 20, 'system-mds', 'system-mds', false),
    ('H', 'Ministry of Highways', 30, 'system-mds', 'system-mds', false),
    ('M', 'Municipality', 40, 'system-mds', 'system-mds', false),
    ('O', 'OGC', 50, 'system-mds', 'system-mds', false),
    ('P', 'Placer Surface', 60, 'system-mds', 'system-mds', false),
    ('R', 'Reclaimed', 70, 'system-mds', 'system-mds', false),
    ('X', 'Mineral Exploration Surface', 80, 'system-mds', 'system-mds', false),
    ('A', 'Aboriginal', 90, 'system-mds', 'system-mds', false),
    ('B', 'Abandoned', 100, 'system-mds', 'system-mds', false),
    ('N', 'Not Permitted', 110, 'system-mds', 'system-mds', false),
    ('I', 'Investigative Use S&G', 120, 'system-mds', 'system-mds', false),
    ('MIM', 'Mineral/Coal', 130, 'system-mds', 'system-mds', true),
    ('MIP', 'Pits/Quarry', 140, 'system-mds', 'system-mds', true)
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

INSERT INTO permit_condition_category
(condition_category_code, step, description, active_ind, display_order, create_user, update_user)
VALUES
	('GEC', 'A.', 'General Conditions', true, 10, 'system-mds', 'system-mds'),
	('HSC', 'B.', 'Health and Safety Conditions', true, 20, 'system-mds', 'system-mds'),
	('GOC', 'C.', 'Geotechnical Conditions', true, 30, 'system-mds', 'system-mds'),
	('ELC', 'D.', 'Environmental Land and Watercourses Conditions', true, 40, 'system-mds', 'system-mds'),
  ('RCC', 'E.', 'Reclamation and Closure Program Conditions', true, 50, 'system-mds', 'system-mds')
on conflict do nothing;

INSERT INTO permit_condition_type
(condition_type_code, description, active_ind, display_order, create_user, update_user)
VALUES
	('SEC', 'Permit Section', true, 10, 'system-mds', 'system-mds'),
	('CON', 'Condition', true, 20, 'system-mds', 'system-mds'),
	('LIS', 'List Item', true, 30, 'system-mds', 'system-mds')
on conflict do nothing;

INSERT INTO consequence_classification_status
    (
    consequence_classification_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('LOW', 'Low', 10, 'system-mds', 'system-mds'),
    ('SIG', 'Significant', 20, 'system-mds', 'system-mds'),
    ('HIG', 'High', 30, 'system-mds', 'system-mds'),
    ('VHIG', 'Very High', 35, 'system-mds', 'system-mds'),
    ('EXT', 'Extreme', 50, 'system-mds', 'system-mds'),
    ('NOD', 'N/A (No Dam)', 60, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO tsf_operating_status
    (
    tsf_operating_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('OPT', 'Operating', 20, 'system-mds', 'system-mds'),
    ('CLO', 'Closed', 10, 'system-mds', 'system-mds'),
    ('CAM', 'Inactive (C&M)', 30, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO explosives_permit_status (
    explosives_permit_status_code,
    description,
    display_order,
    create_user,
    update_user
)
VALUES
    ('APP', 'Approved', 10, 'system-mds', 'system-mds'),
    ('REJ', 'Rejected', 20, 'system-mds', 'system-mds'),
    ('WIT', 'Withdrawn', 30, 'system-mds', 'system-mds'),
    ('REC', 'Received', 40, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO explosives_permit_magazine_type (
    explosives_permit_magazine_type_code,
    description,
    create_user,
    update_user
)
VALUES
    ('EXP', 'Explosive Magazine', 'system-mds', 'system-mds'),
    ('DET', 'Detonator Magazine', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO explosives_permit_document_type (
    explosives_permit_document_type_code,
    description,
    active_ind,
    display_order,
    document_template_code,
    create_user,
    update_user
)
VALUES
    ('PER', 'Explosives Storage and Use Permit', true, 0, 'ESP', 'system-mds', 'system-mds'),
    ('LET', 'Permit Enclosed Letter', true, 10, 'ESL', 'system-mds', 'system-mds'),
    ('APP', 'Approval Letter', true, 20, NULL, 'system-mds', 'system-mds'),
    ('REJ', 'Rejection Letter', true, 30, NULL, 'system-mds', 'system-mds'),
    ('WIT', 'Withdrawal Confirmation', true, 40, NULL, 'system-mds', 'system-mds'),
    ('COR', 'Correspondence', true, 50, NULL, 'system-mds', 'system-mds'),
    ('FOR', 'Application Form', true, 60, NULL, 'system-mds', 'system-mds'),
    ('BLA', 'Blasting Plan', true, 70, NULL, 'system-mds', 'system-mds'),
    ('MAP', 'Maps (Site Plan)', true, 80, NULL, 'system-mds', 'system-mds'),
    ('SIT', 'Site Security Plan', true, 90, NULL, 'system-mds', 'system-mds'),
    ('FIR', 'Fire Safety Plan', true, 100, NULL, 'system-mds', 'system-mds'),
    ('OPE', 'Operational Notification', true, 110, NULL, 'system-mds', 'system-mds'),
    ('RIS', 'Risk Analysis', true, 120, NULL, 'system-mds', 'system-mds'),
    ('WIR', 'Withdrawal Request', true, 130, NULL, 'system-mds', 'system-mds'),
    ('CAN', 'Cancellation/Closure Request', true, 140, NULL, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

UPDATE document_template SET form_spec_json = '[]' WHERE document_template_code = 'ESP';
UPDATE document_template SET form_spec_json = '[
      {
      "id": "letter_date",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "context-value": "{DATETIME.UTCNOW}",
      "required": true
    },
    {
      "id": "letter_body_label_0",
      "type": "LABEL",
      "context-value": "Enclosed please find new Explosives Storage and Use Permit <Permit Number> made out to <Permittee> for the storage of explosives/detonators at the <Mine Name> mine site.  "
    },
    {
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Please ensure these copies of the permit and the magazine rules are posted in the magazines.  When the permit is no longer required, if the site conditions under which the permit was issued are no longer valid or upon closure of mining operations, please return the permit to this office for cancellation.",
      "required": true
    },
    {
      "id": "letter_body_label_1",
      "type": "LABEL",
      "context-value": "Thank you.\n\nSincerely,"
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
]' WHERE document_template_code = 'ESL';
