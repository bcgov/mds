
/*
Table has FK references to other tables that are populated in seed_data. Does not pass script validaiton if included directly in seed_data.sql
*/


INSERT INTO mine_status_xref
    (
    mine_operation_status_code,
    mine_operation_status_reason_code,
    mine_operation_status_sub_reason_code,
    create_user,
    update_user
    )
VALUES
    ('ABN', null, null, 'system-mds', 'system-mds'),
    ('CLD', null, null, 'system-mds', 'system-mds'),
    ('CLD', 'CM', null, 'system-mds', 'system-mds'),
    ('CLD', 'REC', 'LTM', 'system-mds', 'system-mds'),
    ('CLD', 'REC', 'LWT', 'system-mds', 'system-mds'),
    ('CLD', 'REC', 'PRP', 'system-mds', 'system-mds'),
    ('CLD', 'ORP', 'LTM', 'system-mds', 'system-mds'),
    ('CLD', 'ORP', 'LWT', 'system-mds', 'system-mds'),
    ('CLD', 'ORP', 'RNS', 'system-mds', 'system-mds'),
    ('CLD', 'ORP', 'SVR', 'system-mds', 'system-mds'),
    ('CLD', 'UN', null, 'system-mds', 'system-mds'),
    ('NS', null, null, 'system-mds', 'system-mds'),
    ('OP', 'YR', null, 'system-mds', 'system-mds'),
    ('OP', 'SEA', null, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
