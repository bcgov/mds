-- 4. Migrate MINE STATUS
-- Create the ETL_STATUS table

DO $$
DECLARE
    old_row   integer;
    new_row   integer;
BEGIN
    RAISE NOTICE 'Start updating mine status:';
    RAISE NOTICE '.. Step 1 of 2: Scan new mine records in MMS';
    -- This is the intermediary table that will be used to store mine status from the MMS database.
    CREATE TABLE IF NOT EXISTS ETL_STATUS (
        mine_status_xref_guid uuid,
        mine_guid uuid            ,
        mine_no   varchar(7)      ,
        status_code varchar(10)
    );
    SELECT count(*) FROM ETL_STATUS into old_row;

    WITH mms_new AS(
        SELECT *
        FROM mms.mmsmin mms_profile
        WHERE NOT EXISTS (
            SELECT  1
            FROM    ETL_STATUS
            WHERE   mine_no = mms_profile.mine_no
        )
    )
    -- Upsert data into ETL_STATUS from MMS
    INSERT INTO ETL_STATUS
    SELECT
        gen_random_uuid() AS mine_status_xref_guid,
        mine.mine_guid,
        mine.mine_no  ,
        CASE mms_new.sta_cd
            when 'B' THEN 'ABN'
            ELSE NULL
        END AS status_code
    FROM mms_new
    INNER JOIN mine ON
        mine.mine_no=mms_new.mine_no;
    SELECT count(*) FROM ETL_STATUS INTO new_row;
    RAISE NOTICE '....# of new mine record found in MMS: %', (new_row-old_row);
END $$;

DO $$
DECLARE
    old_row         integer;
    new_row         integer;
BEGIN
    RAISE NOTICE '.. Step 2 of 2: Update mine statuses in MDS';
    SELECT count(*) FROM mine_status into old_row;

    -- Upsert data from etl table into mine_status
    WITH new_record AS (
        SELECT *
        FROM ETL_STATUS
        WHERE NOT EXISTS (
            SELECT  1
            FROM    mine_status
            WHERE   mine_guid = ETL_STATUS.mine_guid
        )
    )
    INSERT INTO mine_status
    SELECT
        gen_random_uuid()        ,
        new.mine_guid            ,
        xref.mine_status_xref_guid,
        now()                    ,
        '9999-12-31'::date       ,
        'mms_migration'          ,
        now()                    ,
        'mms_migration'          ,
        now()
    FROM new_record new
    JOIN mine_status_xref xref ON new.status_code = xref.mine_operation_status_code
    WHERE status_code = 'ABN';
    SELECT count(*) FROM mine_status into new_row;
    RAISE NOTICE '....# of new mine status records loaded into MDS: %.', (new_row-old_row);
    RAISE NOTICE '....Total mine status records in the MDS: %.', new_row;
    RAISE NOTICE 'Finish updating mine status in MDS';
END $$;
