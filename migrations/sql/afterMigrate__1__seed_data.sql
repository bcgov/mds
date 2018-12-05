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

INSERT INTO mds_required_document_category
    (
    req_document_category_guid,
    req_document_category
    )
VALUES
    ('6ab98b9a-0e66-4f26-99de-e3c270dea7b6', 'MINE_TAILINGS'),
    ('6ab98b9a-0e66-4f26-99de-e3c270dea7b7', 'MINE_OTHER')
ON CONFLICT DO NOTHING;

INSERT INTO required_document_due_date_type(
    req_document_due_date_type,
    req_document_due_date_description,
    ACTIVE_IND,
    create_user,
    update_user
)
VALUES
    ('FIS','Reports due on fiscal year end.', 'true', 'system-mds', 'system-mds'),
    ('ANV','Reports due on an aniversary of operation, permit, etc...', 'true', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mds_required_document (
    req_document_name,
    req_document_description,
    req_document_category_guid,
    ACTIVE_IND,
    req_document_due_date_type,
    req_document_due_date_period_months,
    create_user,
    update_user
    )
VALUES
    ('Annual Reclamation', '10.4.4a', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('Annual DSI', '10.4.4b', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('5 year DSR', '10.5.4', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 60, 'system-mds', 'system-mds'),
    ('ITRB Activities (Annual)', '10.4.4c', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('Register of tailings storage facilities and dams', '10.4.3', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('MERP Record of Testing', '3.7.1', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('Annual Manager''s Report', '10.4.4', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('OMS Manual', '10.5.2', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','ANV', 12, 'system-mds', 'system-mds'),
    ('Annual reconciliation of water balance and water management plans', '10.4.1', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','ANV', 12, 'system-mds', 'system-mds'),
    ('TSF risk assessment', '10.4.2', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','ANV', 12, 'system-mds', 'system-mds'),
    ('Mine Emergency Preparedness and Response Plan (MERP)', '3.7.1', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','ANV', 0, 'system-mds', 'system-mds'),
    ('Annual TSF and Dam safety recommendations', '10.4.4d', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('Performance of high risk dumps', '10.4.4e', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('OTHER_TEST_REPORT', 'testing filter on category', '6ab98b9a-0e66-4f26-99de-e3c270dea7b7','true','ANV', 12, 'system-mds', 'system-mds')
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

INSERT INTO mine_tenure_type (
    mine_tenure_type_id,
    mine_tenure_type_name,
    create_user,
    update_user
)
VALUES
    (1, 'Coal', 'system-mds', 'system-mds'),
    (2, 'Mineral', 'system-mds', 'system-mds'),
    (3, 'Placer', 'system-mds', 'system-mds'),
    (4, 'BC Land', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mine_party_appt_type_code (
        mine_party_appt_type_code,
        description,
        display_order,
        create_user,
        update_user
) VALUES  
    ('EOR', 'Engineer Of Record', 2, 'system-mds', 'system-mds'),
    ('MMG', 'Mine Manager', 1, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
