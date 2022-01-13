INSERT INTO party_business_role_code (party_business_role_code, description, create_user, update_user) 
VALUES ('PRL', 'Project Lead', 'system-mds', 'system-mds');

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Sarah','Alloisio','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Samuel','Barnes','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Tracy','Bush','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Christine','Cziglan','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Lynn','Davis','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Morgan','Dyas','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Kristy','Emery','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Mark','Hall','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Bryan','Jackson','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Jolene','Jackson','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Teresa','Morris','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Sean','Shaw','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Jen','Stuart','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;

with rows as(
INSERT INTO party (first_name, party_name,create_user, update_user, party_type_code)
VALUES ('Mohammad','Vahedifar','system-mds', 'system-mds','PER') RETURNING party_guid
)
INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM rows;
