
DELETE FROM permit where permit_id not in (select permit_id from permit_amendment);

--assign ETL_PERMIT.permit_guid to guids that were actually imported. 
--our import got confused because party_combo_id was different, even though mine_no/permit_no was the same,
-- --needs to seen as a permitee change.... 
DO $$                  
    BEGIN 
        IF EXISTS
            ( SELECT 1
              FROM   information_schema.tables 
              WHERE  table_schema = 'public'
              AND    table_name = 'etl_permit'
            )
        then
            UPDATE ETL_PERMIT etl2 SET permit_guid = p.permit_guid
            from permit p
            inner join etl_permit etl on p.permit_guid = etl.permit_guid
            where etl2.mine_guid = etl.mine_guid
            and etl.permit_no = etl.permit_no;
        END IF ;
    END
   $$ ;