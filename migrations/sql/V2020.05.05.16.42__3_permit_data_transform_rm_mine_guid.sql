alter table permit drop column mine_guid CASCADE;
delete from permit where permit_id not in (select permit_id from permit_amendment);
---e1-update ETL_PERMIT to reflect these permit changes

DO $$   
    BEGIN 
        IF EXISTS
            ( SELECT 1
                FROM   information_schema.tables 
                WHERE  table_schema = 'public'
                AND    table_name = 'etl_permit'
            )
        then
            update ETL_PERMIT e
            set permit_guid = (
                select permit_guid 
                from permit 
                where permit.permit_no = e.permit_no
            );
        END IF;
    END
$$ ; 