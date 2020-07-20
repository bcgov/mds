---2--reassign permit_amendment parent to common permit record (one for each number)

UPDATE now_application_identity nai
set permit_id =
    (select p2.permit_id
     from permit p2
     where p2.permit_no = p.permit_no
     order by p2.permit_id
     limit 1)
from permit p
where p.permit_id = nai.permit_id;


alter table permit
drop column mine_guid CASCADE;


delete
from permit
where permit_id not in
        (select permit_id
         from permit_amendment);

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