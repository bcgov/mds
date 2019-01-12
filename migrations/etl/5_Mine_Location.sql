-- 1. Migrate MINE LOCATION
-- Create the ETL_LOCATION table


DO $$
DECLARE
    old_row   integer;
    new_row   integer;
BEGIN
    RAISE NOTICE 'Start updating mine location:';
    RAISE NOTICE '.. Step 1 of 2: Scan new mine records in MMS';
    -- This is the intermediary table that will be used to store mine location data from the MMS database.
    CREATE TABLE IF NOT EXISTS ETL_LOCATION (
        mine_guid         uuid          ,
        mine_no           varchar(7)    ,
        lat_dec           numeric(9,7)  ,
        lon_dec           numeric(11,7)
    );
    SELECT count(*) FROM ETL_LOCATION into old_row;
    -- Upsert data into ETL_LOCATION from MMS
    -- If new rows have been added since the last ETL, only insert the new ones.
    WITH mms_new AS(
        SELECT *
        FROM mms.mmsmin
        WHERE NOT EXISTS (
            SELECT  1
            FROM    ETL_LOCATION
            WHERE   mine_no = mms.mmsmin.mine_no
        )
    )
    INSERT INTO ETL_LOCATION (
        mine_guid        ,
        mine_no          ,
        lat_dec          ,
        lon_dec
    )
    SELECT
        gen_random_uuid()  ,
        mms_new.mine_no    ,
        mms_new.lat_dec    ,
        mms_new.lon_dec
    FROM mms_new;
    SELECT count(*) FROM ETL_LOCATION INTO new_row;
    RAISE NOTICE '....# of new mine record found in MMS: %', (new_row-old_row);
END $$;


DO $$
DECLARE
    old_row         integer;
    new_row         integer;
    location_row    integer;
BEGIN
    RAISE NOTICE '.. Step 2 of 2: Update mine location in MDS';
    SELECT count(*) FROM mine into old_row;

    -- Upsert data from new_record into mine_location
    WITH new_record AS (
        SELECT *
        FROM ETL_LOCATION
        WHERE NOT EXISTS (
            SELECT  1
            FROM    mine_location
            WHERE   mine_no = ETL_LOCATION.mine_no
        )
    ), pmt_now AS (
        SELECT
            lat_dec,
            lon_dec,
            permit_no,
            mms.mmsnow.mine_no
        FROM mms.mmsnow, mms.mmspmt
        WHERE mms.mmspmt.cid = mms.mmsnow.cid
    ), pmt_now_preferred AS (
        SELECT
            lat_dec,
            lon_dec,
            permit_no,
            mine_no
        FROM pmt_now
        WHERE
            permit_no != ''
            AND substring(permit_no, 1, 2) NOT IN ('CX', 'MX')
    )
    INSERT INTO mine_location(
        mine_location_guid  ,
        mine_guid           ,
        latitude            ,
        longitude           ,
        geom                ,
        effective_date      ,
        expiry_date         ,
        create_user         ,
        create_timestamp    ,
        update_user         ,
        update_timestamp    )
    SELECT
        gen_random_uuid()   ,
        new.mine_guid       ,
        CASE
            -- Insert lat from preferred permit
            WHEN (
                SELECT count(lat_dec)
                FROM pmt_now_preferred
                WHERE lat_dec IS NOT NULL AND pmt_now_preferred.mine_no = new.mine_no
            ) > 0
            THEN (
                SELECT lat_dec
                FROM pmt_now_preferred
                -- TODO: Replace limit with latest
                WHERE lat_dec IS NOT NULL AND pmt_now_preferred.mine_no = new.mine_no LIMIT 1
            )
            -- Insert lat from fallback permit
            WHEN (
                SELECT count(lat_dec)
                FROM pmt_now
                WHERE lat_dec IS NOT NULL AND pmt_now.mine_no = new.mine_no
            ) > 0
            THEN (
                SELECT lat_dec
                FROM pmt_now
                -- TODO: Replace limit with latest
                WHERE lat_dec IS NOT NULL AND pmt_now.mine_no = new.mine_no LIMIT 1
            )
            -- Insert lat from notice of work
            WHEN (
                SELECT count(lat_dec)
                FROM mms.mmsnow
                WHERE lat_dec IS NOT NULL AND mms.mmsnow.mine_no = new.mine_no
            ) > 0
            THEN (
                SELECT lat_dec
                FROM mms.mmsnow
                -- TODO: Replace limit with latest
                WHERE lat_dec IS NOT NULL AND mms.mmsnow.mine_no = new.mine_no LIMIT 1
            )
            -- Fallback to lat from mine table
            ELSE new.lat_dec
        END AS latitude,
        CASE
            -- Insert lon from preferred permit
            WHEN (
                SELECT count(lon_dec)
                FROM pmt_now_preferred
                WHERE lon_dec IS NOT NULL AND pmt_now_preferred.mine_no = new.mine_no
            ) > 0
            THEN (
                SELECT lon_dec
                FROM pmt_now_preferred
                -- TODO: Replace limit with latest
                WHERE lon_dec IS NOT NULL AND pmt_now_preferred.mine_no = new.mine_no LIMIT 1
            )
            -- Insert lon from fallback permit
            WHEN (
                SELECT count(lon_dec)
                FROM pmt_now
                WHERE lon_dec IS NOT NULL AND pmt_now.mine_no = new.mine_no
            ) > 0
            THEN (
                SELECT lon_dec
                FROM pmt_now
                -- TODO: Replace limit with latest
                WHERE lon_dec IS NOT NULL AND pmt_now.mine_no = new.mine_no LIMIT 1
            )
            -- Insert lon from notice of work
            WHEN (
                SELECT count(lon_dec)
                FROM mms.mmsnow
                WHERE lon_dec IS NOT NULL AND mms.mmsnow.mine_no = new.mine_no
            ) > 0
            THEN (
                SELECT lon_dec
                FROM mms.mmsnow
                -- TODO: Replace limit with latest
                WHERE lon_dec IS NOT NULL AND mms.mmsnow.mine_no = new.mine_no LIMIT 1
            )
            -- Fallback to lon from mine table
            ELSE new.lon_dec
        END AS longitude,
        ST_SetSRID(ST_MakePoint(new.lon_dec, new.lat_dec),3005),
        now()               ,
        '9999-12-31'::date  ,
        'mms_migration'     ,
        now()               ,
        'mms_migration'     ,
        now()
    FROM new_record new
    WHERE
        (new.lat_dec IS NOT NULL AND new.lon_dec IS NOT NULL)
        AND
        (new.lat_dec <> 0 AND new.lon_dec <> 0);

        -- TODO: ensure LATEST
        -- TODO: ensure APPROVED (where appropriate)

    SELECT count(*) FROM mine into new_row;
    SELECT count(*) FROM mine_location into location_row;

    RAISE NOTICE '....# of new mine records loaded into MDS: %.', (new_row-old_row);
    RAISE NOTICE '....Total mine records in the MDS: %.', new_row;
    RAISE NOTICE '....Total mine records with location info in the MDS: %.', location_row;
    RAISE NOTICE 'Finish updating mine list in MDS';
END $$;
