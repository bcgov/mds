DO $$   
    BEGIN 
        IF EXISTS
            ( SELECT 1
                FROM   information_schema.tables 
                WHERE  table_schema = 'public'
                AND    table_name = 'etl_permit'
            )
        then
            ALTER TABLE ETL_PERMIT
            ADD COLUMN IF NOT EXISTS security_adjustment numeric;
        END IF;
    END
$$ ;
