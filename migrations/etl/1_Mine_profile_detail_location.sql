-- 1. Migrate MINE PROFILE
-- Create the ETL_PROFILE table


DO $$
DECLARE
    old_row integer;
    new_row integer;
BEGIN
    RAISE NOTICE 'Start updating mine profile:';
    RAISE NOTICE '.. Step 1 of 2: Scan new mine records in MMS';
    -- This is the intermediary table that will be used to store mine profile from the MMS database.
    CREATE TABLE IF NOT EXISTS ETL_PROFILE (
        mine_guid         uuid          ,
        mine_no           varchar(7)    ,
        mine_nm           varchar(60)   ,
        mine_region       varchar(2)    ,
        mine_typ          varchar(3)    ,
        lat_dec           numeric(9,7)  ,
        lon_dec           numeric(11,7) ,
        major_mine_ind    boolean
    );
    SELECT count(*) FROM ETL_PROFILE into old_row;

    -- Upsert data into ETL_PROFILE from MMS
    RAISE NOTICE '.. Update existing records with latest MMS data';
    UPDATE ETL_PROFILE
    SET mine_nm = mms.mmsmin.mine_nm   ,
        mine_typ = mms.mmsmin.mine_typ ,
        lat_dec = mms.mmsmin.lat_dec   ,
        lon_dec = mms.mmsmin.lon_dec,
        major_mine_ind = (
            mms.mmsmin.min_lnk = 'Y'
            AND
            mms.mmsmin.min_lnk IS NOT NULL
        ),
        mine_region = CASE mms.mmsmin.reg_cd
                WHEN '1' THEN 'SW'
                WHEN '2' THEN 'SC'
                WHEN '3' THEN 'SE'
                WHEN '4' THEN 'NE'
                WHEN '5' THEN 'NW'
                ELSE null
            END
    FROM mms.mmsmin
    WHERE mms.mmsmin.mine_no = ETL_PROFILE.mine_no;
    SELECT count(*) FROM ETL_PROFILE INTO old_row;
    RAISE NOTICE '....# of mine records to be updated in MDS: %', old_row;

    -- If new rows have been added since the last ETL, only insert the new ones.
    -- Generate a random UUID for mine_guid
    WITH mms_new AS(
        SELECT *
        FROM mms.mmsmin mms_profile
        WHERE NOT EXISTS (
            SELECT  1
            FROM    ETL_PROFILE
            WHERE   mine_no = mms_profile.mine_no
        )
    )
    INSERT INTO ETL_PROFILE (
        mine_guid       ,
        mine_no         ,
        mine_nm         ,
        mine_region     ,
        mine_typ        ,
        lat_dec         ,
        lon_dec         ,
        major_mine_ind  )
    SELECT
        gen_random_uuid()  ,
        mms_new.mine_no    ,
        mms_new.mine_nm    ,
        CASE mms_new.reg_cd
            WHEN '1' THEN 'SW'
            WHEN '2' THEN 'SC'
            WHEN '3' THEN 'SE'
            WHEN '4' THEN 'NE'
            WHEN '5' THEN 'NW'
            ELSE null
        END AS mine_region ,
        mms_new.mine_typ   ,
        mms_new.lat_dec    ,
        mms_new.lon_dec    ,
        (mms_new.min_lnk = 'Y' AND mms_new.min_lnk IS NOT NULL)
    FROM mms_new;
    SELECT count(*) FROM ETL_PROFILE INTO new_row;
    RAISE NOTICE '....# of new mine record found in MMS: %', (new_row-old_row);
END $$;




DO $$
DECLARE
    old_row         integer;
    new_row         integer;
    update_row      integer;
BEGIN
    RAISE NOTICE '.. Step 2 of 3: Update mine in MDS';
    SELECT count(*) FROM mine into old_row;

    -- Upsert data from ETL_PROFILE into mine table
    RAISE NOTICE '.. Update existing records with latest MMS data';
    UPDATE mine
        SET mine_name        = ETL_PROFILE.mine_nm       ,
            mine_region      = ETL_PROFILE.mine_region   ,
            major_mine_ind   = ETL_PROFILE.major_mine_ind,
            update_user      = 'mms_migration'           ,
            update_timestamp = now()
    FROM ETL_PROFILE
    WHERE ETL_PROFILE.mine_guid = mine.mine_guid;
    SELECT count(*) FROM mine, ETL_PROFILE WHERE ETL_PROFILE.mine_guid = mine.mine_guid INTO update_row;
    RAISE NOTICE '....# of mine records updated in MDS: %', update_row;

    WITH new_record AS (
        SELECT *
        FROM ETL_PROFILE
        WHERE NOT EXISTS (
            SELECT  1
            FROM    mine
            WHERE   mine_guid = ETL_PROFILE.mine_guid
        )
    )
    INSERT INTO mine(
        mine_guid           ,
        mine_no             ,
        mine_name           ,
        mine_region         ,
        major_mine_ind      ,
        create_user         ,
        create_timestamp    ,
        update_user         ,
        update_timestamp    )
    SELECT
        new.mine_guid       ,
        new.mine_no         ,
        new.mine_nm         ,
        new.mine_region     ,
        major_mine_ind      ,
        'mms_migration'     ,
        now()               ,
        'mms_migration'     ,
        now()
    FROM new_record new;
    SELECT count(*) FROM mine into new_row;
    RAISE NOTICE '....# of new mine records loaded into MDS: %.', (new_row-old_row);
    RAISE NOTICE '....Total mine records in MDS: %.', new_row;
END $$;




DO $$
DECLARE
    location_row    integer;
BEGIN
    -- Upsert data from new_record into mine_location
    WITH new_record AS (
        SELECT *
        FROM ETL_PROFILE
        WHERE NOT EXISTS (
            SELECT  1
            FROM    mine_location
            WHERE   mine_no = ETL_PROFILE.mine_no
        )
    ), pmt_now AS (
        SELECT
            lat_dec,
            lon_dec,
            permit_no,
            mms.mmsnow.mine_no,
            CASE
              -- Approved Date if available
              WHEN mms.mmspmt.appr_dt IS NOT NULL
              THEN extract(epoch from mms.mmspmt.appr_dt)::bigint
              -- Update Number if available
              WHEN mms.mmsnow.upd_no IS NOT NULL
              THEN mms.mmsnow.upd_no::integer
              ELSE NULL::integer
            END AS latest
        FROM mms.mmsnow, mms.mmspmt
        WHERE
            mms.mmsnow.cid = mms.mmspmt.cid
            AND lat_dec IS NOT NULL
            AND lon_dec IS NOT NULL
    ), pmt_now_preferred AS (
        SELECT
            lat_dec,
            lon_dec,
            permit_no,
            mine_no,
            latest
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
        COALESCE(
            -- Preferred Latitude
            (
                SELECT lat_dec
                FROM pmt_now_preferred
                WHERE mine_no = new.mine_no
                ORDER BY latest DESC
                LIMIT 1
            ),
            -- Fallback Latitude
            (
                SELECT lat_dec
                FROM pmt_now
                WHERE mine_no = new.mine_no
                ORDER BY latest DESC
                LIMIT 1
            ),
            -- NoW Latitude
            (
                SELECT lat_dec
                FROM mms.mmsnow
                WHERE mine_no = new.mine_no
                ORDER BY upd_no DESC
                LIMIT 1
            ),
            -- Default Latitude
            new.lat_dec
        ) AS latitude,
        COALESCE(
            -- Preferred Longitude
            (
                SELECT lon_dec
                FROM pmt_now_preferred
                WHERE mine_no = new.mine_no
                ORDER BY latest DESC
                LIMIT 1
            ),
            -- Fallback Longitude
            (
                SELECT lon_dec
                FROM pmt_now
                WHERE mine_no = new.mine_no
                ORDER BY latest DESC
                LIMIT 1
            ),
            -- NoW Longitude
            (
                SELECT lon_dec
                FROM mms.mmsnow
                WHERE mine_no = new.mine_no
                ORDER BY upd_no DESC
                LIMIT 1
            ),
            -- Default Longitude
            new.lon_dec
        ) AS longitude,
        ST_SetSRID(ST_MakePoint(new.lon_dec, new.lat_dec),3005),
        now()               ,
        '9999-12-31'::date  ,
        'mms_migration'     ,
        now()               ,
        'mms_migration'     ,
        now()
    FROM new_record new
    WHERE
        -- Present + valid in MMSMIN
        (
            (new.lat_dec IS NOT NULL AND new.lon_dec IS NOT NULL)
            AND
            (new.lat_dec <> 0 AND new.lon_dec <> 0)
        ) OR (
        -- Present + valid in MMSNOW
            SELECT COUNT(mine_no)
            FROM mms.mmsnow
            WHERE
                new.mine_no = mine_no
                AND (lat_dec IS NOT NULL AND lon_dec IS NOT NULL)
                AND (lat_dec <> 0 AND lon_dec <> 0)
        ) > 0;
    SELECT count(*) FROM mine_location into location_row;

    -- Upsert data from new_record into mine_type
    WITH new_record AS (
        SELECT
            mine_guid,
            mine_typ
        FROM ETL_PROFILE
        WHERE NOT EXISTS (
            SELECT  1
            FROM    mine_type
            WHERE   mine_no = ETL_PROFILE.mine_no
        )
    )
    INSERT INTO mine_type(
        mine_type_guid       ,
        mine_guid            ,
        mine_tenure_type_code,
        create_user          ,
        create_timestamp     ,
        update_user          ,
        update_timestamp     )
    SELECT
        gen_random_uuid()   ,
        new.mine_guid       ,
        CASE
          when new.mine_typ = ANY('{CX,CS,CU}'::text[]) THEN 'COL'
          when new.mine_typ = ANY('{MS,MU,LS,IS,IU}'::text[]) THEN 'MIN'
          when new.mine_typ = ANY('{PS,PU}'::text[]) THEN 'PLR'
          when new.mine_typ = ANY('{Q,CM,SG}'::text[]) THEN 'BCL'
          ELSE null
        END AS mine_tenure_type_code,
        'mms_migration'     ,
        now()               ,
        'mms_migration'     ,
        now()
    FROM new_record new
    WHERE
        mine_typ = ANY('{CX,CS,CU,MS,MU,LS,IS,IU,PS,PU,Q,CM,SG}'::text[]);


    RAISE NOTICE '....Total mine records with location info in the MDS: %.', location_row;
    RAISE NOTICE 'Finish updating mine list in MDS';
END $$;
