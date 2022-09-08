
/*
Table has FK references to other tables that are populated in seed_data. Does not pass script validaiton if included directly in seed_data.sql
*/


INSERT INTO mine_status_xref
    (
    mine_operation_status_code,
    mine_operation_status_reason_code,
    mine_operation_status_sub_reason_code,
    create_user,
    update_user,
    description
    )
VALUES
    ('ABN', null, null, 'system-mds', 'system-mds', 'The mine site is shut down, the permit obligations have been fulfilled. Bond has been returned if permittee completed reclamation work.'),
    ('CLD', null, null, 'system-mds', 'system-mds', null),
    ('CLD', 'CM', null, 'system-mds', 'system-mds', 'The mine is temporarily closed. It is expected that it will eventually re-open. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.'),
    ('CLD', 'REC', null, 'system-mds', 'system-mds', 'The mine is closed and not expected to re-open.'),
    ('CLD', 'REC', 'LTM', 'system-mds', 'system-mds', 'The mine is closed and not expected to re-open. Reclamation work is under way. There are long-term care and maintenance activities on site. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.'),
    ('CLD', 'REC', 'LWT', 'system-mds', 'system-mds', 'The mine is closed and not expected to re-open. Reclamation work is under way. There are long-term care and maintenance activities on site in addition to water treatment. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.'),
    ('CLD', 'REC', 'PRP', 'system-mds', 'system-mds', 'Reclamation work is complete, no additional care required. Ministry needs to return bond and close permit for mine to be Abandoned.'),
    ('CLD', 'UN', null, 'system-mds', 'system-mds', 'Ministry has not determined if the permittee is able or available to meet permit obligations. A visit to the site is required.'),
    ('NS', null, null, 'system-mds', 'system-mds', 'No mine related work has started at this site (including exploration). The mine record may have been created as placeholder for an exploration permit. Sites with closed exploration permits that are constructing production facilities also fit into this category.'),
    ('OP', null, null, 'system-mds', 'system-mds', 'This mine operates year-round (can be conducting exploration and/or production activities).'),
    ('OP', 'YR', null, 'system-mds', 'system-mds', 'This mine operates year-round (can be conducting exploration and/or production activities).'),
    ('OP', 'SEA', null, 'system-mds', 'system-mds', 'This mine operates seasonally. Dates shown are from the most recently approved NoW application. Confirm operating dates with operator or permittee before visiting.')
ON CONFLICT DO NOTHING;
