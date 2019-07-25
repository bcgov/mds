CREATE OR REPLACE FUNCTION transfer_mine_information() RETURNS void AS $$
    BEGIN
        -- Query performance optimization
        SET max_parallel_workers_per_gather TO 8;
        -- 1. ETL mine data from MMS
        -- Create the ETL_MINE table
        DECLARE
            old_row    integer;
            new_row    integer;
            update_row integer;
        BEGIN
            RAISE NOTICE 'Start updating mine data:';
            RAISE NOTICE '.. Step 1 of 5: Scan new mine records in MMS';
            -- This is the intermediary table that will be used to store regional mine data from MMS
            -- It contains the mines relevant to the ETL process and should be used in place
            -- of the mines table
            CREATE TABLE IF NOT EXISTS ETL_MINE (
                mine_guid         uuid          ,
                mine_no           varchar(7)    ,
                mine_name         varchar(60)   ,
                mine_region       varchar(2)    ,
                mine_type         varchar(3)    ,
                latitude          numeric(11,7)  ,
                longitude         numeric(11,7) ,
                major_mine_ind    boolean,
            deleted_ind       boolean
            );
            CREATE INDEX IF NOT EXISTS etl_mine_mine_no_idx ON ETL_MINE (mine_no);
            CREATE INDEX IF NOT EXISTS etl_mine_mine_guid_idx ON ETL_MINE (mine_guid);
            SELECT count(*) FROM ETL_MINE into old_row;

            -- Migration step from previous ETL process
            -- Delete all major mines from the ETL_MINE table
            DELETE FROM ETL_MINE WHERE major_mine_ind = TRUE;

            -- Upsert data into ETL_MINE from MMS
            RAISE NOTICE '.. Update existing records with latest MMS data';
            UPDATE ETL_MINE
            SET mine_name      = mms.mmsmin.mine_nm,
                latitude       = CASE
                                   WHEN mms.mmsmin.lat_dec <> 0 AND mms.mmsmin.lon_dec <> 0 THEN mms.mmsmin.lat_dec
                                   ELSE NULL
                                 END,
                longitude      = CASE
                                   WHEN mms.mmsmin.lat_dec <> 0 AND mms.mmsmin.lon_dec <> 0 THEN mms.mmsmin.lon_dec
                                   ELSE NULL
                                 END,
                major_mine_ind = (mms.mmsmin.min_lnk = 'Y' AND mms.mmsmin.min_lnk IS NOT NULL),
                mine_region    = CASE mms.mmsmin.reg_cd
                                    WHEN '1' THEN 'SW'
                                    WHEN '2' THEN 'SC'
                                    WHEN '3' THEN 'SE'
                                    WHEN '4' THEN 'NE'
                                    WHEN '5' THEN 'NW'
                                    ELSE NULL
                                END,
                mine_type      = CASE
                                    WHEN mms.mmsmin.mine_typ = ANY('{CX,CS,CU}'::text[]) THEN 'COL'
                                    WHEN mms.mmsmin.mine_typ = ANY('{MS,MU,LS,IS,IU}'::text[]) THEN 'MIN'
                                    WHEN mms.mmsmin.mine_typ = ANY('{PS,PU}'::text[]) THEN 'PLR'
                                    WHEN mms.mmsmin.mine_typ = ANY('{Q,CM,SG}'::text[]) THEN 'BCL'
                                    ELSE NULL
                                END,
                deleted_ind    = LOWER(mms.mmsmin.mine_nm) LIKE '%delete%' OR LOWER(mms.mmsmin.mine_nm) LIKE '%deleted%' OR LOWER(mms.mmsmin.mine_nm) LIKE '%reuse%'
            FROM mms.mmsmin
            WHERE mms.mmsmin.mine_no = ETL_MINE.mine_no;
            SELECT count(*) FROM ETL_MINE, mms.mmsmin WHERE ETL_MINE.mine_no = mms.mmsmin.mine_no INTO update_row;
            RAISE NOTICE '....# of mine records in ETL_MINE: %', old_row;
            RAISE NOTICE '....# of mine records updated in ETL_MINE: %', update_row;

            -- If new rows have been added since the last ETL, only insert the new ones.
            -- Exclude major mines
            -- Generate a random UUID for mine_guid
            RAISE NOTICE '.. Insert new MMS mine records into ETL_MINE';
            WITH mms_new AS(
                SELECT *
                FROM mms.mmsmin
                WHERE NOT EXISTS (
                    SELECT  1
                    FROM    ETL_MINE
                    WHERE   mine_no = mms.mmsmin.mine_no
                )
            )
            INSERT INTO ETL_MINE (
                mine_guid       ,
                mine_no         ,
                mine_name       ,
                mine_region     ,
                mine_type       ,
                latitude        ,
                longitude       ,
                major_mine_ind  ,
                deleted_ind     )
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
                    ELSE NULL
                END,
                CASE
                    WHEN mms_new.mine_typ = ANY('{CX,CS,CU}'::text[]) THEN 'COL'
                    WHEN mms_new.mine_typ = ANY('{MS,MU,LS,IS,IU}'::text[]) THEN 'MIN'
                    WHEN mms_new.mine_typ = ANY('{PS,PU}'::text[]) THEN 'PLR'
                    WHEN mms_new.mine_typ = ANY('{Q,CM,SG}'::text[]) THEN 'BCL'
                    ELSE NULL
                END,
                CASE
                    WHEN mms_new.lat_dec <> 0 AND mms_new.lon_dec <> 0 THEN mms_new.lat_dec
                    ELSE NULL
                END,
                CASE
                    WHEN mms_new.lat_dec <> 0 AND mms_new.lon_dec <> 0 THEN mms_new.lon_dec
                    ELSE NULL
                END,
                (mms_new.min_lnk = 'Y' AND mms_new.min_lnk IS NOT NULL),
            CASE WHEN lower(mms_new.mine_nm) LIKE '%delete%' OR lower(mms_new.mine_nm) LIKE '%deleted%' OR lower(mms_new.mine_nm) LIKE '%reuse%' THEN TRUE ELSE FALSE END
            FROM mms_new
            WHERE (mms_new.min_lnk = 'Y' AND mms_new.min_lnk IS NOT NULL) = FALSE;
            SELECT count(*) FROM ETL_MINE INTO new_row;
            RAISE NOTICE '....# of new mine records found in MMS: %', (new_row-old_row);
            RAISE NOTICE '....Total mine records in ETL_MINE: %.', new_row;
        END;

        DECLARE
            old_row         integer;
            new_row         integer;
            update_row      integer;
        BEGIN
            RAISE NOTICE '.. Step 2 of 5: Update mine in MDS';
            SELECT count(*) FROM mine into old_row;

            -- Upsert data from ETL_MINE into mine table
            RAISE NOTICE '.. Update existing records with latest MMS data';
            UPDATE mine
            SET mine_name        = ETL_MINE.mine_name     ,
                mine_region      = ETL_MINE.mine_region   ,
                major_mine_ind   = ETL_MINE.major_mine_ind,
                deleted_ind      = ETL_MINE.deleted_ind   ,
                update_user      = 'mms_migration'        ,
                update_timestamp = now()
            FROM ETL_MINE
            WHERE ETL_MINE.mine_guid = mine.mine_guid
            AND (ETL_MINE.mine_name != mine.mine_name
                OR ETL_MINE.mine_region != mine.mine_region
                OR ETL_MINE.major_mine_ind != mine.major_mine_ind);
            SELECT count(*) FROM mine, ETL_MINE WHERE ETL_MINE.mine_guid = mine.mine_guid INTO update_row;
            RAISE NOTICE '....# of mine records in MDS: %', old_row;
            RAISE NOTICE '....# of mine records updated in MDS: %', update_row;

            WITH new_record AS (
                SELECT *
                FROM ETL_MINE
                WHERE NOT EXISTS (
                    SELECT  1
                    FROM    mine
                    WHERE   mine_guid = ETL_MINE.mine_guid
                )
            )
            INSERT INTO mine(
                mine_guid           ,
                mine_no             ,
                mine_name           ,
                mine_region         ,
                major_mine_ind      ,
                deleted_ind         ,
                create_user         ,
                create_timestamp    ,
                update_user         ,
                update_timestamp    )
            SELECT
                new.mine_guid       ,
                new.mine_no         ,
                new.mine_name       ,
                new.mine_region     ,
                new.major_mine_ind  ,
                new.deleted_ind     ,
                'mms_migration'     ,
                now()               ,
                'mms_migration'     ,
                now()
            FROM new_record new;
            SELECT count(*) FROM mine into new_row;
            RAISE NOTICE '....# of new mine records loaded into MDS: %.', (new_row-old_row);
            RAISE NOTICE '....Total mine records in MDS: %.', new_row;
        END;

        DECLARE
            old_row         integer;
            new_row         integer;
            update_row      integer;
        BEGIN
            RAISE NOTICE '.. Step 3 of 5: Transform location data';
            -- This is the intermediary table that will be used to store transformed
            -- mine location data
            CREATE TABLE IF NOT EXISTS ETL_LOCATION (
                mine_guid       uuid                ,
                mine_no         varchar(7)          ,
                latitude        numeric(9,7)        ,
                longitude       numeric(11,7)       ,
                mine_location_description       varchar
            );
            CREATE INDEX ON ETL_LOCATION (mine_no);
            CREATE INDEX ON ETL_LOCATION (mine_guid);
            SELECT count(*) FROM ETL_LOCATION into old_row;

            -- Upsert data into ETL_LOCATION from MMS
            RAISE NOTICE '.. Sync existing records with latest ETL_MINE data';
            -- Create temp table for upsert process
            CREATE TEMP TABLE IF NOT EXISTS pmt_now (
                lat_dec   numeric(11,7),
                lon_dec   numeric(11,7),
                mine_location_description    varchar,
                permit_no varchar(12)  ,
                mine_no   varchar(10)  ,
                latest    bigint
            );

            INSERT INTO pmt_now(
                lat_dec ,
                lon_dec ,
                mine_location_description,
                permit_no,
                mine_no  ,
                latest
            )
            SELECT
                lat_dec,
                lon_dec,
                site_desc,
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
                AND lat_dec <> 0
                AND lon_dec <> 0;

            -- Update existing ETL_LOCATION records
            WITH pmt_now_preferred AS (
                SELECT
                    lat_dec,
                    lon_dec,
                    mine_location_description,
                    permit_no,
                    mine_no,
                    latest
                FROM pmt_now
                WHERE
                    permit_no != ''
                    AND substring(permit_no, 1, 2) NOT IN ('CX', 'MX')
                    AND (lat_dec <> 0 AND lon_dec <> 0)
            )
            UPDATE ETL_LOCATION
            SET mine_guid = ETL_MINE.mine_guid,
                mine_no   = ETL_MINE.mine_no  ,
                mine_location_description = COALESCE(
                    (
                        SELECT mine_location_description
                        FROM pmt_now_preferred
                        WHERE mine_no = ETL_LOCATION.mine_no
                        ORDER BY latest DESC
                        LIMIT 1
                    )),
                latitude  = COALESCE(
                    -- Preferred Latitude
                    (
                        SELECT lat_dec
                        FROM pmt_now_preferred
                        WHERE mine_no = ETL_MINE.mine_no
                        ORDER BY latest DESC
                        LIMIT 1
                    ),
                    -- Fallback Latitude
                    (
                        SELECT lat_dec
                        FROM pmt_now
                        WHERE mine_no = ETL_MINE.mine_no
                        ORDER BY latest DESC
                        LIMIT 1
                    ),
                    -- NoW Latitude
                    (
                        SELECT lat_dec
                        FROM mms.mmsnow
                        WHERE mine_no = ETL_MINE.mine_no
                              AND
                              (lat_dec <> 0 AND lon_dec <> 0)
                        ORDER BY upd_no DESC
                        LIMIT 1
                    ),
                    -- Default Latitude
                    ETL_MINE.latitude
                ),
                longitude = COALESCE(
                    -- Preferred Longitude
                    (
                        SELECT lon_dec
                        FROM pmt_now_preferred
                        WHERE mine_no = ETL_MINE.mine_no
                        ORDER BY latest DESC
                        LIMIT 1
                    ),
                    -- Fallback Longitude
                    (
                        SELECT lon_dec
                        FROM pmt_now
                        WHERE mine_no = ETL_MINE.mine_no
                        ORDER BY latest DESC
                        LIMIT 1
                    ),
                    -- NoW Longitude
                    (
                        SELECT lon_dec
                        FROM mms.mmsnow
                        WHERE mine_no = ETL_MINE.mine_no
                              AND
                              (lat_dec <> 0 AND lon_dec <> 0)
                        ORDER BY upd_no DESC
                        LIMIT 1
                    ),
                    -- Default Longitude
                    ETL_MINE.longitude
                )
            FROM ETL_MINE
            WHERE
                ETL_MINE.mine_guid = ETL_LOCATION.mine_guid
                AND
                -- Matches business logic requirements
                (
                    (
                        -- Present + valid in MMSMIN
                        (ETL_MINE.latitude IS NOT NULL AND ETL_MINE.longitude IS NOT NULL)
                        AND
                        (ETL_MINE.latitude <> 0 AND ETL_MINE.longitude <> 0)
                    ) OR (
                    -- Present + valid in MMSNOW
                        SELECT COUNT(mine_no)
                        FROM mms.mmsnow
                        WHERE
                            ETL_MINE.mine_no = mine_no
                            AND (lat_dec IS NOT NULL AND lon_dec IS NOT NULL)
                            AND (lat_dec <> 0 AND lon_dec <> 0)
                    ) > 0
                );
            SELECT count(*) FROM ETL_LOCATION, ETL_MINE WHERE ETL_LOCATION.mine_guid = ETL_MINE.mine_guid INTO update_row;
            RAISE NOTICE '....# of records in ETL_LOCATION: %', old_row;
            RAISE NOTICE '....# of records updated in ETL_LOCATION: %', update_row;

            RAISE NOTICE '.. Insert new ETL_MINE records into ETL_LOCATION';
            WITH new_record AS (
                SELECT *
                FROM ETL_MINE
                WHERE NOT EXISTS (
                    SELECT  1
                    FROM    ETL_LOCATION
                    WHERE   mine_guid = ETL_MINE.mine_guid
                )
            ), pmt_now_preferred AS (
                SELECT
                    lat_dec,
                    lon_dec,
                    mine_location_description,
                    permit_no,
                    mine_no,
                    latest
                FROM pmt_now
                WHERE
                    permit_no != ''
                    AND substring(permit_no, 1, 2) NOT IN ('CX', 'MX')
                    AND (lat_dec <> 0 AND lon_dec <> 0)

            )
            INSERT INTO ETL_LOCATION(
                mine_guid           ,
                mine_no             ,
                mine_location_description,
                latitude            ,
                longitude           )
            SELECT
                new.mine_guid,
                new.mine_no  ,
                COALESCE(
                    (
                        SELECT mine_location_description
                        FROM pmt_now_preferred
                        WHERE mine_no = new.mine_no
                        LIMIT 1
                    )
                ),
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
                              AND
                              (lat_dec <> 0 AND lon_dec <> 0)
                        ORDER BY upd_no DESC
                        LIMIT 1
                    ),
                    -- Default Latitude
                    new.latitude
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
                              AND
                              (lat_dec <> 0 AND lon_dec <> 0)
                        ORDER BY upd_no DESC
                        LIMIT 1
                    ),
                    -- Default Longitude
                    new.longitude
                ) AS longitude
            FROM new_record new
            WHERE
                -- Present + valid in MMSMIN
                (
                    (new.latitude IS NOT NULL AND new.longitude IS NOT NULL)
                    AND
                    (new.latitude <> 0 AND new.longitude <> 0)
                ) OR (
                -- Present + valid in MMSNOW
                    SELECT COUNT(mine_no)
                    FROM mms.mmsnow
                    WHERE
                        new.mine_no = mine_no
                        AND (lat_dec IS NOT NULL AND lon_dec IS NOT NULL)
                        AND (lat_dec <> 0 AND lon_dec <> 0)
                ) > 0;
            SELECT count(*) FROM ETL_LOCATION into new_row;
            RAISE NOTICE '....# of new mine_location records found in MMS: %', (new_row-old_row);
            RAISE NOTICE '....Total mine_location records in ETL_LOCATION: %.', new_row;

            DROP TABLE pmt_now;
        END;

        DECLARE
            old_row         integer;
            update_row      integer;
        BEGIN
            RAISE NOTICE '.. Step 4 of 5: Update mine location in MDS';
            SELECT count(*) FROM mine into old_row;

            -- Update mine with data from ETL_LOCATION
            RAISE NOTICE '.. Update existing records with latest MMS data';
            WITH updated_rows AS (
                UPDATE mine
                SET latitude         = ETL_LOCATION.latitude ,
                    longitude        = ETL_LOCATION.longitude,
                    mine_location_description = ETL_LOCATION.mine_location_description,
                    geom             = ST_SetSRID(ST_MakePoint(ETL_LOCATION.longitude, ETL_LOCATION.latitude), 3005),
                    update_user      = 'mms_migration'      ,
                    update_timestamp = now()
                FROM ETL_LOCATION
                INNER JOIN ETL_MINE
                    ON ETL_LOCATION.mine_guid = ETL_MINE.mine_guid
                WHERE
                    ETL_LOCATION.mine_guid = mine.mine_guid
                AND (ETL_LOCATION.latitude != mine.latitude
                    OR ETL_LOCATION.longitude != mine.longitude
                    OR ETL_LOCATION.mine_location_description != mine.mine_location_description)
                RETURNING 1
            )
            SELECT count(*) FROM updated_rows INTO update_row;
            RAISE NOTICE '....# of mine location records in MDS: %', old_row;
            RAISE NOTICE '....# of mine location records updated in MDS: %', update_row;
        END;

        DECLARE
            old_row    integer;
            new_row    integer;
            update_row integer;
        BEGIN
            RAISE NOTICE '.. Step 5 of 5: Update mine_type in MDS';
            SELECT count(*) FROM mine_type into old_row;

            -- Upsert data from new_record into mine_type
            RAISE NOTICE '.. Update existing records with latest MMS data';
            UPDATE mine_type
            SET active_ind = FALSE
            FROM ETL_MINE
            WHERE
                ETL_MINE.mine_guid = mine_type.mine_guid
                AND
                ETL_MINE.mine_type != mine_tenure_type_code;
            SELECT count(*) FROM mine_type, ETL_MINE WHERE mine_type.mine_guid = ETL_MINE.mine_guid AND ETL_MINE.mine_type != mine_tenure_type_code INTO update_row;
            RAISE NOTICE '....# of mine_type records in MDS: %', old_row;
            RAISE NOTICE '....# of mine_type records updated in MDS: %', update_row;

            RAISE NOTICE '.. Insert new ETL_MINE records into mine_type';
            WITH new_record AS (
                SELECT
                    mine_guid,
                    mine_type
                FROM ETL_MINE
                WHERE NOT EXISTS (
                    SELECT  1
                    FROM    mine_type
                    WHERE   mine_guid = ETL_MINE.mine_guid
                    AND     active_ind = TRUE
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
                new.mine_type       ,
                'mms_migration'     ,
                now()               ,
                'mms_migration'     ,
                now()
            FROM new_record new
            WHERE mine_type IS NOT NULL;
            SELECT count(*) FROM mine_type into new_row;
            RAISE NOTICE '....# of new mine_type records inserted into MDS: %', (new_row-old_row);
            RAISE NOTICE '....Total mine_type records in MDS: %.', new_row;
            RAISE NOTICE 'Finish updating mine list in MDS';
        END;
    END;
$$LANGUAGE plpgsql;
