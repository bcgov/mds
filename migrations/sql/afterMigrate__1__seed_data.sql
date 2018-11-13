INSERT INTO permit_status_code (
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

INSERT INTO party_type_code (
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
INSERT INTO mine_operation_status_code (
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

INSERT INTO mine_operation_status_reason_code (
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

INSERT INTO mine_operation_status_sub_reason_code (
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

INSERT INTO mds_required_document (
    req_document_name,
    req_document_description,
    req_document_category,
    effective_date,
    create_user,
    update_user
    )
VALUES
    ('Annual Reclamation', 'whole bunch of stuff', 'MINE_TAILINGS','2017-07-01', 'system-mds', 'system-mds'),
    ('Annual DSI', 'Dam Safety Inspection and whole bunch of stuff', 'MINE_TAILINGS','2017-07-01', 'system-mds', 'system-mds'),
    ('5year DSR', 'Dam Safety Inspection', 'MINE_TAILINGS','2017-07-01', 'system-mds', 'system-mds'),
    ('OMS Manual', 'Operations Maintainence Surveilance', 'MINE_TAILINGS','2017-07-01', 'system-mds', 'system-mds'),
    ('OTHER_TEST_REPORT', 'testing filter on category', 'OTHER_REPORT','2017-07-01', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mine_region_code (
    region_code,
    description,
    display_order,
    create_user,
    update_user
)
VALUES
    ('SW','South West Region',10,'system-mds', 'system-mds'),
    ('SC','South Central Region',20,'system-mds', 'system-mds'),
    ('NW','North West Region',30,'system-mds', 'system-mds'),
    ('NE','North East Region',40,'system-mds', 'system-mds'),
    ('SE','South East Region',50,'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
