truncate table mine_status_xref
CASCADE;

alter table mine_status_xref drop column effective_date;
alter table mine_status_xref drop column expiry_date;
alter table mine_status_xref add column active_ind boolean DEFAULT true NOT null;

alter table mine_status add column active_ind boolean DEFAULT true NOT null;

alter table mine_operation_status_code drop column effective_date;
alter table mine_operation_status_code drop column expiry_date;
alter table mine_operation_status_code add column active_ind boolean DEFAULT true NOT null;

alter table mine_operation_status_reason_code drop column effective_date;
alter table mine_operation_status_reason_code drop column expiry_date;
alter table mine_operation_status_reason_code add column active_ind boolean DEFAULT true NOT null;

alter table mine_operation_status_sub_reason_code drop column effective_date;
alter table mine_operation_status_sub_reason_code drop column expiry_date;
alter table mine_operation_status_sub_reason_code add column active_ind boolean DEFAULT true NOT null;

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

drop table if exists etl_status;