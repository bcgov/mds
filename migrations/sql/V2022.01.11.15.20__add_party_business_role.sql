INSERT INTO party_business_role_code (party_business_role_code, description, create_user, update_user) 
VALUES ('PRL', 'Project Lead', 'system-mds', 'system-mds');


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Sarah' and 
        party.party_name='Alloisio';

INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Samuel' and 
        party.party_name='Barnes';
    

INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Tracy' and 
        party.party_name='Bush';


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Christine' and 
        party.party_name='Cziglan';


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Lynn' and 
        party.party_name='Davis';


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Morgan' and 
        party.party_name='Dyas';


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Kristy' and 
        party.party_name='Emery';


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Mark' and 
        party.party_name='Hall';


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Bryan' and 
        party.party_name='Jackson';


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Jolene' and 
        party.party_name='Jackson';


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Teresa' and 
        party.party_name='Morris';


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Sean' and 
        party.party_name='Shaw';


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Jen' and 
        party.party_name='Stuart';


INSERT INTO party_business_role_appt (party_guid, party_business_role_code, start_date, create_user, update_user)
select party_guid, 'PRL', NOW(), 'system-mds', 'system-mds'
FROM party
WHERE party.first_name='Mohammad' and 
        party.party_name='Vahedifar';
