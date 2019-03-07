-- Permit expiry_date was renamed to authorization_end_date in the ETL script, but the peristant ETL_PERMIT table was not altered if it already existed.
DO $$                  
    BEGIN 
        IF EXISTS
            ( SELECT 1
              FROM   information_schema.tables 
              WHERE  table_schema = 'public'
              AND    table_name = 'etl_permit'
            )
        then
	        IF NOT EXISTS
	            ( SELECT column_name 
					FROM information_schema.columns 
					WHERE table_name='etl_permit' and column_name='authorization_end_date'
	            )
	        THEN
				ALTER TABLE IF EXISTS ETL_PERMIT RENAME expiry_date TO authorization_end_date;
	        END IF ;
        END IF ;
    END
   $$ ;
   