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

drop table if exists etl_status;