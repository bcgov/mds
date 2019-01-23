-- 1. Migrate MINE PROFILE
-- Create the ETL_PROFILE table


DO $$
DECLARE
    old_row   integer;
    new_row   integer;
BEGIN
    RAISE NOTICE 'Start updating mine profile:';
    RAISE NOTICE '.. Step 1 of 2: Scan new mine records in MMS';
    -- This is the intermediary table that will be used to store mine profile from the MMS database.
    CREATE TABLE IF NOT EXISTS ETL_PROFILE (
        mine_guid         uuid          ,
        mine_no           varchar(7)    ,
        mine_nm           varchar(60)   ,
        reg_cd            varchar(1)    ,
        mine_typ          varchar(3)    ,
        lat_dec           numeric(9,7)  ,
        lon_dec           numeric(11,7) ,
        major_mine_ind    boolean
    );
    SELECT count(*) FROM ETL_PROFILE into old_row;
    -- Upsert data into ETL_PROFILE from MMS
    -- Generate a random UUID for mine_guid
    INSERT INTO ETL_PROFILE (
        mine_guid       ,
        mine_no         ,
        mine_nm         ,
        reg_cd          ,
        mine_typ        ,
        lat_dec         ,
        lon_dec         ,
        major_mine_ind  )
    SELECT
        gen_random_uuid()  ,
        mms.mine_no    ,
        mms.mine_nm    ,
        mms.reg_cd     ,
        mms.mine_typ   ,
        mms.lat_dec    ,
        mms.lon_dec    ,
        CASE
            WHEN mms.min_lnk = 'Y' THEN TRUE
            ELSE FALSE
        END AS major_mine_ind
    FROM mms.mmsmin mms;
    SELECT count(*) FROM ETL_PROFILE INTO new_row;
    RAISE NOTICE '....# of mine records pulled from MMS: %', (new_row-old_row);
END $$;




DO $$
DECLARE
    old_row         integer;
    new_row         integer;
    location_row    integer;
BEGIN
    RAISE NOTICE '.. Step 2 of 2: Update mine details in MDS';
    SELECT count(*) FROM mine into old_row;
    -- Upsert data from new_record into mine table
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
        CASE new.reg_cd
            WHEN '1' THEN 'SW'
            WHEN '2' THEN 'SC'
            WHEN '3' THEN 'SE'
            WHEN '4' THEN 'NE'
            WHEN '5' THEN 'NW'
            ELSE null
        END AS reg_cd       ,
        major_mine_ind      ,
        'mms.migration'     ,
        now()               ,
        'mms_migration'     ,
        now()
    FROM new_record new;

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
    SELECT count(*) FROM mine into new_row;
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

    RAISE NOTICE '....# of new mine records loaded into MDS: %.', (new_row-old_row);
    RAISE NOTICE '....Total mine records in the MDS: %.', new_row;
    RAISE NOTICE '....Total mine records with location info in the MDS: %.', location_row;
    RAISE NOTICE 'Finish updating mine list in MDS';
END $$;
