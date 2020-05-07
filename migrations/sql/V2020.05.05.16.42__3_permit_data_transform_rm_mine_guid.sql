alter table permit drop column mine_guid CASCADE;
delete from permit where permit_id not in (select permit_id from permit_amendment);

update ETL_PERMIT e
set permit_guid = (
    select permit_guid 
    from permit 
    where permit.permit_no = e.permit_no
);
