DO $$                  
    BEGIN 
        IF EXISTS
            ( SELECT 1
              FROM   information_schema.tables 
              WHERE  table_schema = 'public'
              AND    table_name = 'etl_mine'
            )
        then
	        IF NOT EXISTS
	            ( SELECT column_name 
					FROM information_schema.columns 
					WHERE table_name='etl_mine' and column_name='mms_alias'
	            )
	        THEN
				ALTER TABLE IF EXISTS ETL_MINE ADD COLUMN mms_alias varchar;
	        END IF ;
        END IF ;
    END
$$ ;
   

alter table mine add column mms_alias varchar;
