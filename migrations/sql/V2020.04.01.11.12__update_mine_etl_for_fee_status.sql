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
					WHERE table_name='etl_mine' and column_name='exemption_fee_status_code'
	            )
	        THEN
				ALTER TABLE IF EXISTS ETL_MINE ADD COLUMN exemption_fee_status_code varchar(3);
	        END IF ;
        END IF ;
    END
   $$ ;
   