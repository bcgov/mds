CREATE FUNCTION transfer_mine_information() RETURNS void AS $$
    BEGIN
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
            SELECT count(*) FROM ETL_MINE into old_row;

            -- Migration step from previous ETL process
            -- Delete all major mines from the ETL_MINE table
            DELETE FROM ETL_MINE WHERE major_mine_ind = TRUE;

            -- Upsert data into ETL_MINE from MMS
            RAISE NOTICE '.. Update existing records with latest MMS data';
            UPDATE ETL_MINE
            SET mine_name      = mms.mmsmin.mine_nm,
                latitude       = mms.mmsmin.lat_dec,
                longitude      = mms.mmsmin.lon_dec,
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
                mms_new.lat_dec    ,
                mms_new.lon_dec    ,
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
            WHERE ETL_MINE.mine_guid = mine.mine_guid;
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
                longitude       numeric(11,7)
            );
            SELECT count(*) FROM ETL_LOCATION into old_row;

            -- Upsert data into ETL_LOCATION from MMS
            RAISE NOTICE '.. Sync existing records with latest ETL_MINE data';
            -- Create temp table for upsert process
            CREATE TEMP TABLE IF NOT EXISTS pmt_now (
                lat_dec   numeric(11,7) ,
                lon_dec   numeric(11,7),
                permit_no varchar(12)  ,
                mine_no   varchar(10)  ,
                latest    bigint
            );

            INSERT INTO pmt_now(
                lat_dec ,
                lon_dec ,
                permit_no,
                mine_no  ,
                latest
            )
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
                AND lon_dec IS NOT NULL;

            -- Update existing ETL_LOCATION records
            WITH pmt_now_preferred AS (
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
            UPDATE ETL_LOCATION
            SET mine_guid = ETL_MINE.mine_guid,
                mine_no   = ETL_MINE.mine_no  ,
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
                    permit_no,
                    mine_no,
                    latest
                FROM pmt_now
                WHERE
                    permit_no != ''
                    AND substring(permit_no, 1, 2) NOT IN ('CX', 'MX')
            )
            INSERT INTO ETL_LOCATION(
                mine_guid           ,
                mine_no             ,
                latitude            ,
                longitude           )
            SELECT
                new.mine_guid,
                new.mine_no  ,
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
            new_row         integer;
            update_row      integer;
        BEGIN
            RAISE NOTICE '.. Step 4 of 5: Update mine_location in MDS';
            SELECT count(*) FROM mine_location into old_row;

            -- Upsert data from ETL_LOCATION into mine_location
            RAISE NOTICE '.. Update existing records with latest MMS data';
            WITH updated_rows AS (
                UPDATE mine_location
                SET latitude         = ETL_LOCATION.latitude ,
                    longitude        = ETL_LOCATION.longitude,
                    geom             = ST_SetSRID(ST_MakePoint(ETL_LOCATION.longitude, ETL_LOCATION.latitude), 3005),
                    update_user      = 'mms_migration'      ,
                    update_timestamp = now()
                FROM ETL_LOCATION
                INNER JOIN ETL_MINE
                    ON ETL_LOCATION.mine_guid = ETL_MINE.mine_guid
                WHERE
                    ETL_LOCATION.mine_guid = mine_location.mine_guid
                RETURNING 1
            )
            SELECT count(*) FROM updated_rows INTO update_row;
            RAISE NOTICE '....# of mine_location records in MDS: %', old_row;
            RAISE NOTICE '....# of mine_location records updated in MDS: %', update_row;

            RAISE NOTICE '.. Insert new ETL_LOCATION records into mine_location';
            WITH new_record AS (
                SELECT *
                FROM ETL_LOCATION
                WHERE NOT EXISTS (
                    SELECT  1
                    FROM    mine_location
                    WHERE   mine_guid = ETL_LOCATION.mine_guid
                )
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
                new.latitude        ,
                new.longitude       ,
                ST_SetSRID(ST_MakePoint(new.longitude, new.latitude), 3005),
                now()               ,
                '9999-12-31'::date  ,
                'mms_migration'     ,
                now()               ,
                'mms_migration'     ,
                now()
            FROM new_record new;
            SELECT count(*) FROM mine_location into new_row;
            RAISE NOTICE '....# of new mine_location records loaded into MDS: %.', (new_row-old_row);
            RAISE NOTICE '....Total mine records with location info in the MDS: %.', new_row;
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
            SET mine_tenure_type_code = ETL_MINE.mine_type,
                update_user           = 'mms_migration'      ,
                update_timestamp      = now()
            FROM ETL_MINE
            WHERE
                ETL_MINE.mine_guid = mine_type.mine_guid
                AND
                mine_type IS NOT NULL;
            SELECT count(*) FROM mine_type, ETL_MINE WHERE mine_type.mine_guid = ETL_MINE.mine_guid INTO update_row;
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

CREATE FUNCTION transfer_mine_manager_information() RETURNS void AS $$
    BEGIN
        DECLARE
            old_row    integer;
            insert_row integer;
            update_row integer;
            total_row  integer;
        BEGIN
            RAISE NOTICE 'Start updating mine manager:';
            RAISE NOTICE '.. Step 1 of 3: Scan new managers in MMS';
            -- This is the intermediary table that will be used to store mine manager profile from the MMS database.
            CREATE TABLE IF NOT EXISTS ETL_MANAGER(
                mine_guid   uuid                ,
                mine_no     varchar(7)          ,
                party_guid  uuid                ,
                first_name  varchar(100)        ,
                surname     varchar(100)        ,
                phone_no    varchar(12)         ,
                email       varchar(254)        ,
                effective_date      date        ,
                person_combo_id     varchar(600),
                mgr_combo_id        varchar(600)
            );
            SELECT count(*) FROM ETL_MANAGER into old_row;

            RAISE NOTICE '.. Update existing records with latest MMS data';

            --Step 1: Get regional mine_no's
            WITH regional_mine AS (
                SELECT mine_no
                FROM mms.mmsmin
                WHERE (min_lnk = 'N' OR min_lnk is null)
            ),

            --Step 2, Get most recent NOW
            latest_now AS (
                SELECT n.mine_no mine_no, Max(n.cid) cid
                FROM mms.mmsnow n
                WHERE n.mine_no in (SELECT mine_no from regional_mine)
                GROUP BY n.mine_no
            ),
            --Step 3, get contact connection that is a Mine Manager
            latest_now_ccc AS ( --contact connection
                SELECT latest_now.mine_no mine_no,
                    latest_now.cid cid,
                    ccc.cid_ccn contact_cid
                FROM mms.mmsccc ccc
                LEFT JOIN latest_now ON latest_now.cid = ccc.cid
                WHERE SubStr(ccc.type_ind,3,1) = 'Y'
            ),    -- Step 4, get contact from contact connection

            --4. Select existing manager record
            existing_manager AS (
                SELECT latest_now_ccc.mine_no mine_no,
                    cn.cid person_combo_id,
                    latest_now_ccc.mine_no||cn.cid as mgr_combo_id
                FROM mms.mmsccn cn
                LEFT JOIN latest_now_ccc ON latest_now_ccc.contact_cid = cn.cid
                WHERE latest_now_ccc.mine_no||cn.cid IN (
                    SELECT  mgr_combo_id
                    FROM    ETL_MANAGER
                )
            ),
            --5. Check if manager is an existing person
            existing_person AS (
                SELECT DISTINCT ON (person_combo_id)
                    person_combo_id
                FROM existing_manager
                WHERE person_combo_id IN (
                    SELECT  person_combo_id
                    FROM    ETL_Manager
                )
            ),
            --6. Extract contact info and formatting
            existing_person_info AS(
                SELECT
                    cid AS person_combo_id  ,
                    COALESCE(NULLIF(regexp_replace(contact_info.name,' ', '', 'g'),''),'Unknown') first_name,
                    COALESCE(NULLIF(regexp_replace(contact_info.l_name,' ', '', 'g'),''),'Unknown') surname ,
                    NULLIF(regexp_replace(phone, '\D', '','g'),'')::numeric phone_no                        , --Extract numbers only from phone_no field
                    COALESCE(NULLIF(regexp_replace(contact_info.email,' ', '', 'g'),''),'Unknown') email    ,
                    COALESCE(contact_info.add_dt,now()) effective_date
                FROM mms.mmsccn contact_info
                WHERE cid IN (
                    SELECT  person_combo_id
                    FROM    existing_person
                )
            ),
            -- Remove the extra digit in phone number
            existing_person_info_get_phone AS(
                SELECT
                    gen_random_uuid() AS party_guid   ,
                    person_combo_id                   ,
                    first_name                        ,
                    surname                           ,
                    CASE
                        WHEN phone_no>=10^10 AND phone_no<2*10^10 THEN (phone_no-10^10 )::varchar--Remove country code for phone_no
                        WHEN phone_no>10^9 AND phone_no<10^10 THEN (phone_no)::varchar
                        ELSE 'Unknown'
                    END AS phone_no ,
                    email           ,
                    effective_date
                FROM existing_person_info
            ),
            --Format phone number field to match MDS party table schema
            existing_person_info_format_phone AS (
                SELECT
                    party_guid      ,
                    person_combo_id ,
                    first_name      ,
                    surname         ,
                    CASE
                        WHEN phone_no = 'Unknown' THEN phone_no
                        ELSE
                            SUBSTRING(phone_no from 1 for 3)||'-'||
                            SUBSTRING(phone_no from 4 for 3)||'-'||
                            SUBSTRING(phone_no from 7 for 4)
                    END AS phone_no ,
                    email           ,
                    effective_date
                FROM existing_person_info_get_phone
            ),
            --7. Complete list of person info for existing manager record
            person_info AS (
                SELECT * FROM existing_person_info_format_phone
                UNION
                SELECT
                    party_guid      ,
                    person_combo_id ,
                    first_name      ,
                    surname         ,
                    phone_no        ,
                    email           ,
                    effective_date
                FROM ETL_MANAGER
                WHERE person_combo_id IN (
                    SELECT  DISTINCT person_combo_id
                    FROM    existing_manager
                )
            ),
            --8. Complete list of existing regional mine manager
            existing_manager_info AS (
                SELECT
                    manager.mine_no         ,
                    manager.person_combo_id ,
                    manager.mgr_combo_id    ,
                    person.party_guid       ,
                    person.first_name       ,
                    person.surname          ,
                    person.phone_no         ,
                    person.email            ,
                    person.effective_date
                FROM existing_manager manager
                INNER JOIN person_info person
                    ON person.person_combo_id = manager.person_combo_id
            ),
            --9. Update info for a given party at a specific mine
            updated_rows AS (
                UPDATE ETL_MANAGER
                SET first_name      = mms.first_name     ,
                    surname         = mms.surname        ,
                    phone_no        = mms.phone_no       ,
                    email           = mms.email          ,
                    effective_date  = mms.effective_date ,
                    person_combo_id = mms.person_combo_id,
                    mgr_combo_id    = mms.mgr_combo_id
                FROM existing_manager_info mms
                WHERE
                    ETL_MANAGER.mine_no = mms.mine_no
                    AND
                    ETL_MANAGER.party_guid = mms.party_guid
                RETURNING 1
            )
            SELECT count(*) FROM updated_rows INTO update_row;
            RAISE NOTICE '....# of records in ETL_MANAGER: %', old_row;
            RAISE NOTICE '....# of records updated in ETL_MANAGER: %', update_row;


            RAISE NOTICE '.. Insert new MMS mine manager records into ETL_MANAGER';
            --Step 1: Get regional mine_no's
            WITH regional_mine AS (
                SELECT mine_no
                FROM mms.mmsmin
                WHERE (min_lnk = 'N' OR min_lnk is null)
            ),

            --Step 2, Get most recent NOW
            latest_now AS (
                SELECT n.mine_no mine_no, Max(n.cid) cid
                FROM mms.mmsnow n
                WHERE n.mine_no in (SELECT mine_no from regional_mine)
                GROUP BY n.mine_no
            ),
            --Step 3, get contact connection that is a Mine Manager
            latest_now_ccc AS ( --contact connection
                SELECT  latest_now.mine_no mine_no,
                        latest_now.cid cid,
                        ccc.cid_ccn contact_cid
                FROM mms.mmsccc ccc
                LEFT JOIN latest_now ON latest_now.cid = ccc.cid
                WHERE SubStr(ccc.type_ind,3,1) = 'Y'
            ),
            -- Step 4, get contact from contact connection
            new_manager AS (
                SELECT latest_now_ccc.mine_no mine_no,
                    cn.cid person_combo_id,
                    latest_now_ccc.mine_no||cn.cid as mgr_combo_id
                FROM mms.mmsccn cn
                LEFT JOIN latest_now_ccc ON latest_now_ccc.contact_cid = cn.cid
                WHERE latest_now_ccc.mine_no||cn.cid NOT IN (
                    SELECT  mgr_combo_id
                    FROM    ETL_MANAGER
                )
            ),

            --5. Check if manager is a new person
            new_person AS (
                SELECT DISTINCT ON (person_combo_id)
                    person_combo_id
                FROM new_manager
                WHERE person_combo_id NOT IN (
                    SELECT  person_combo_id
                    FROM    ETL_Manager
                )
            ),
            --6. Extract contact info and formatting
            new_person_info AS(
                SELECT
                    cid AS person_combo_id  ,
                    COALESCE(NULLIF(regexp_replace(contact_info.name,' ', '', 'g'),''),'Unknown') first_name,
                    COALESCE(NULLIF(regexp_replace(contact_info.l_name,' ', '', 'g'),''),'Unknown') surname ,
                    NULLIF(regexp_replace(phone, '\D', '','g'),'')::numeric phone_no                        , --Extract numbers only from phone_no field
                    COALESCE(NULLIF(regexp_replace(contact_info.email,' ', '', 'g'),''),'Unknown') email    ,
                    COALESCE(contact_info.add_dt,now()) effective_date --add_dt is the date the record was last updated... maybe not best date for effective date. maybe use mmsnow.entered_date
                FROM mms.mmsccn contact_info
                WHERE cid IN (
                    SELECT  person_combo_id
                    FROM    new_person
                )
            ),
            -- Remove the extra digit in phone number
            new_person_info_get_phone AS(
                SELECT
                    gen_random_uuid() AS party_guid   ,
                    person_combo_id                   ,
                    first_name                        ,
                    surname                           ,
                    CASE
                        WHEN phone_no>=10^10 AND phone_no<2*10^10 THEN (phone_no-10^10 )::varchar--Remove country code for phone_no
                        WHEN phone_no>10^9 AND phone_no<10^10 THEN (phone_no)::varchar
                        ELSE 'Unknown'
                    END AS phone_no ,
                    email           ,
                    effective_date
                FROM new_person_info
            ),
            --Format phone number field to match MDS party table schema
            new_person_info_format_phone AS (
                SELECT
                    party_guid      ,
                    person_combo_id ,
                    first_name      ,
                    surname         ,
                    CASE
                        WHEN phone_no = 'Unknown' THEN phone_no
                        ELSE
                            SUBSTRING(phone_no from 1 for 3)||'-'||
                            SUBSTRING(phone_no from 4 for 3)||'-'||
                            SUBSTRING(phone_no from 7 for 4)
                    END AS phone_no ,
                    email           ,
                    effective_date
                FROM new_person_info_get_phone
            ),
            --7. Complete list of person info for new manager record
            person_info AS (
                SELECT * FROM new_person_info_format_phone
                UNION
                SELECT
                    party_guid      ,
                    person_combo_id ,
                    first_name      ,
                    surname         ,
                    phone_no        ,
                    email           ,
                    effective_date
                FROM ETL_MANAGER
                WHERE   person_combo_id IN (
                    SELECT  DISTINCT person_combo_id
                    FROM    new_manager
                )
            ),
            --8. Complete list of new regional mine manager
            new_manager_info AS (
                SELECT
                    manager.mine_no         ,
                    manager.person_combo_id ,
                    manager.mgr_combo_id    ,
                    person.party_guid       ,
                    person.first_name       ,
                    person.surname          ,
                    person.phone_no         ,
                    person.email            ,
                    person.effective_date
                FROM new_manager manager
                INNER JOIN person_info person   ON
                    person.person_combo_id=manager.person_combo_id
            ),
            --9. Insert new records
            inserted_rows AS (
                INSERT INTO ETL_MANAGER (
                    mine_guid               ,
                    mine_no                 ,
                    party_guid              ,
                    first_name              ,
                    surname                 ,
                    phone_no                ,
                    email                   ,
                    effective_date          ,
                    person_combo_id         ,
                    mgr_combo_id            )
                SELECT
                    mds.mine_guid           ,
                    mms.mine_no             ,
                    mms.party_guid          ,
                    mms.first_name          ,
                    mms.surname             ,
                    mms.phone_no            ,
                    mms.email               ,
                    mms.effective_date      ,
                    mms.person_combo_id     ,
                    mms.mgr_combo_id
                FROM new_manager_info mms
                INNER JOIN ETL_MINE mds ON mds.mine_no = mms.mine_no
                RETURNING 1
            )
            SELECT count(*) FROM inserted_rows INTO insert_row;
            SELECT count(*) FROM ETL_MANAGER INTO total_row;
            RAISE NOTICE '.... # of new manager records loaded into ETL_MANAGER: %', insert_row;
            RAISE NOTICE '....Total records in ETL_MANAGER: %.', total_row;
        END;

        DECLARE
            old_row    integer;
            update_row integer;
            insert_row integer;
            total_row  integer;
        BEGIN
            RAISE NOTICE '.. Step 2 of 3: Update contact details for new person';
            SELECT count(*) FROM party INTO old_row;

            -- Upsert party data from ETL_MANAGER
            RAISE NOTICE '.. Update existing records with latest MMS data';
            WITH updated_rows AS (
            UPDATE party
            SET first_name       = etl.first_name    ,
                party_name       = etl.surname       ,
                phone_no         = etl.phone_no      ,
                phone_ext        = null              ,
                email            = etl.email         ,
                effective_date   = etl.effective_date,
                expiry_date      = '9999-12-31'::date,
                update_user      = 'mms_migration'   ,
                update_timestamp = now()             ,
                party_type_code  = 'PER'
            FROM ETL_MANAGER etl
            WHERE party.party_guid = etl.party_guid
            RETURNING 1
            )
            SELECT COUNT(*) FROM updated_rows INTO update_row;
            RAISE NOTICE '....# of records in party: %', old_row;
            RAISE NOTICE '....# of records updated in party: %', update_row;


            RAISE NOTICE '.. Insert new MMS ETL_MANAGER records into party';
            --Select only new entry in ETL_Manager table
            WITH new_manager AS(
                SELECT DISTINCT ON (party_guid)
                    party_guid     ,
                    first_name     ,
                    surname        ,
                    phone_no       ,
                    email          ,
                    effective_date
                FROM ETL_MANAGER
                WHERE party_guid NOT IN (
                    SELECT  party_guid
                    FROM    party
                )
            ), inserted_rows AS (
                INSERT INTO party(
                    party_guid      ,
                    first_name      ,
                    party_name      ,
                    phone_no        ,
                    phone_ext       ,
                    email           ,
                    effective_date  ,
                    expiry_date     ,
                    create_user     ,
                    create_timestamp,
                    update_user     ,
                    update_timestamp,
                    party_type_code
                )
                SELECT
                    party_guid          ,
                    first_name          ,
                    surname             ,
                    phone_no            ,
                    null                ,
                    email               ,
                    effective_date      ,
                    '9999-12-31'::date  ,
                    'mms_migration'     ,
                    now()               ,
                    'mms_migration'     ,
                    now()               ,
                    'PER'
                FROM new_manager
                RETURNING 1
            )
            SELECT count(*) FROM inserted_rows INTO insert_row;
            SELECT count(*) FROM party INTO total_row;
            RAISE NOTICE '.... # of person records loaded into MDS: %', insert_row;
            RAISE NOTICE '....Total records in party: %.', total_row;
        END;

        DECLARE
            old_row    integer;
            update_row integer;
            insert_row integer;
            delete_row integer;
            total_row  integer;
        BEGIN
            RAISE NOTICE '.. Step 3 of 3: Update mine manager assignment';
            SELECT count(*) FROM mine_party_appt INTO old_row;

            RAISE NOTICE '..Purge mine managers from ETL mines';
            RAISE NOTICE '....# of records in mine_party_appt: %', old_row;
            WITH deleted_rows AS (
                DELETE FROM mine_party_appt
                WHERE
                    -- Only records known to ETL_MANAGER
                    CONCAT(mine_guid, party_guid) IN (
                        SELECT CONCAT(mine_guid, party_guid)
                        FROM ETL_MANAGER
                    )
                    -- Only on mines in ETL process
                    AND
                    mine_guid IN (
                        SELECT mine_guid
                        FROM ETL_MINE
                    )
                    -- Only appts for Mine Managers
                    AND
                    mine_party_appt_type_code = 'MMG'
                RETURNING 1
            )
            SELECT COUNT(*) FROM deleted_rows INTO delete_row;
            SELECT count(*) FROM mine_party_appt INTO old_row;
            RAISE NOTICE '....# of records removed from mine_party_appt: %', delete_row;
            RAISE NOTICE '....# of records remaining in mine_party_appt: %', old_row;

            RAISE NOTICE '.. Insert latest MMS records from ETL_MANAGER into mine_party_appt';
            --select only new record
            WITH new_manager AS
            (
                SELECT *
                FROM ETL_MANAGER
                WHERE NOT EXISTS (
                    SELECT  1
                    FROM    mine_party_appt
                    WHERE
                        party_guid = ETL_MANAGER.party_guid
                    AND
                        mine_guid = ETL_Manager.mine_guid
                    AND
                        mine_party_appt_type_code = 'MMG'
                )
            ), inserted_rows AS (
                INSERT INTO mine_party_appt(
                    mine_party_appt_guid,
                    mine_guid           ,
                    party_guid          ,
                    mine_party_appt_type_code,
                    start_date          ,
                    end_date            ,
                    create_user         ,
                    create_timestamp    ,
                    update_user         ,
                    update_timestamp    ,
                    processed_by        ,
                    processed_on
                )
                SELECT
                    gen_random_uuid()   ,-- Generate a random UUID for mgr_appointment_guid
                    new.mine_guid       ,
                    new.party_guid      ,
                    'MMG'               ,
                    new.effective_date  ,
                    '9999-12-31'::date  ,
                    'mms_migration'     ,
                    now()               ,
                    'mms_migration'     ,
                    now()               ,
                    'mms_migration'     ,
                    now()
                FROM new_manager new
                ON CONFLICT DO NOTHING
                RETURNING 1
            )
            SELECT count(*) FROM inserted_rows INTO insert_row;
            SELECT count(*) FROM mine_party_appt INTO total_row;
            RAISE NOTICE '.... # new manager assignment: %', insert_row;
            RAISE NOTICE '.... Total mine manager appt records: %', total_row;
            RAISE NOTICE 'Finish updating mine manager.';
        END;
    END; 
$$LANGUAGE plpgsql;

CREATE FUNCTION transfer_premit_permitee_information() RETURNS void AS $$
    BEGIN
        
        DECLARE
            company_keyword_special varchar := '[-!0-9@#$&()`+/\"]
                |Mining|Mineral|Resources|National|Regional|Energy|Products
                | and | of |Pacific|Metal|Canada|Canadian|Engineering|Mountain|Lake';
            --case sensitive keyword
            company_keyword_cs  varchar :='Corp|Inc|Expl|Mine|INC|South|North|West';
            --case insensitive keyword
            company_keyword_ci  varchar :='ltd|limited|co.|holdings
                |Contracting|llp|Consultants|Enterprise|service|city
                |ulc|Association|Partnership|Trucking|Property|Division|Industries|Developments';
            old_row    integer;
            insert_row integer;
            update_row integer;
            total_row  integer;
        BEGIN
            RAISE NOTICE 'Start updating mine permit info:';
            RAISE NOTICE '.. Step 1 of 4: Scan permit info in MMS';
            -- This is the intermediary table that will be used to store mine permit and permittee info from the MMS database.
            CREATE TABLE IF NOT EXISTS ETL_PERMIT(
                mine_party_appt_guid   uuid                  ,
                --permit info
                permit_guid            uuid                  ,
                source                 numeric               ,
                mine_guid              uuid                  ,
                mine_no                character varying(12) ,
                permit_no              character varying(12) ,
                permit_cid             character varying(30) ,
                received_date          date                  ,
                issue_date             date                  ,
                authorization_end_date date                  ,
                permit_status_code     character varying(2)  ,
                --permittee info
                party_guid             uuid                  ,
                party_combo_id         character varying(200),
                first_name             character varying(100),
                party_name             character varying(100),
                party_type             character varying(3)  ,
                phone_no               character varying(12) ,
                email                  character varying(254),
                effective_date         date
            );
            SELECT count(*) FROM ETL_PERMIT into old_row;

            CREATE TEMP TABLE IF NOT EXISTS all_permit_info (
                mine_party_appt_guid uuid                    ,
                --permit info
                permit_guid            uuid                  ,
                source                 numeric               ,
                mine_guid              uuid                  ,
                mine_no                character varying(12) ,
                permit_no              character varying(12) ,
                permit_cid             character varying(30) ,
                received_date          date                  ,
                issue_date             date                  ,
                authorization_end_date date                  ,
                permit_status_code     character varying(2)  ,
                --permittee info
                party_guid             uuid                  ,
                party_combo_id         character varying(200),
                first_name             character varying(100),
                party_name             character varying(100),
                party_type             character varying(3)  ,
                phone_no               character varying(12) ,
                email                  character varying(254),
                effective_date         date                  ,
                new_permit             boolean               ,
                new_permittee          boolean
            );

            CREATE INDEX ON all_permit_info (permit_cid);
            CREATE INDEX ON all_permit_info (party_combo_id);

            -- Populate temp table
            RAISE NOTICE '.. Aggregate all permit info';
            WITH
            -- Filter on permit records; Select only the records:
            ---- with valid permit status (closed:z or approved: a)
            ---- AND with non-empty permit number
            permit_list AS (
                SELECT
                    mine_no||permit_no||recv_dt||iss_dt AS combo_id,
                    max(cid) permit_cid
                FROM mms.mmspmt permit_info
                WHERE
                    (sta_cd ~* 'z'  OR sta_cd ~* 'a')
                    AND
                    ((permit_no !~ '^ *$' AND  permit_no IS NOT NULL))
                GROUP BY combo_id
            ),
            permit_info AS (
                SELECT
                    ETL_MINE.mine_guid                                       ,
                    permit_info.mine_no                                      ,
                    permit_info.permit_no                                    ,
                    permit_info.cid AS permit_cid                            ,
                    COALESCE(permit_info.recv_dt,'9999-12-31'::date)  recv_dt,
                    COALESCE(permit_info.iss_dt ,  '9999-12-31'::date) iss_dt,
                    COALESCE(
                        (
                            SELECT end_dt
                            FROM mms.mmsnow
                            WHERE mms.mmsnow.cid = permit_info.cid
                        ),
                        '9999-12-31'::date
                    ) permit_expiry_dt                   ,
                    CASE permit_info.sta_cd
                        WHEN 'Z' THEN 'C' --closed
                        ELSE 'O' --open
                    END AS sta_cd                                            ,
                    permit_info.upd_no
                FROM mms.mmspmt permit_info
                INNER JOIN ETL_MINE ON ETL_MINE.mine_no = permit_info.mine_no
                WHERE permit_info.cid IN (
                    SELECT permit_cid
                    FROM permit_list
                )
            ),
            --Permittee source 1: From company info documented in attached contact in NoW
            --Number of attached contact for each record in permit_list
            permit_contact_list AS(
                SELECT
                    id_ref.cid AS permit_cid    ,
                    count(cid_ccn) AS contact_number
                FROM mms.mmsccc id_ref
                WHERE cid IN (
                    SELECT permit_cid
                    FROM permit_list
                )
                GROUP BY id_ref.cid
            ),
            --For permit record with more than 1 attached contact
            --Select the contact indicated as Permittee
            --If more than 1 contact is indicated as permittee
            --Select the one with maximum contact id (cid_ccn)
            permit_with_multi_contact AS (
                SELECT permit_cid
                FROM  permit_contact_list
                WHERE permit_contact_list.contact_number>1
            ),
            permittee_selection AS (
                SELECT
                    cid  AS permit_cid  ,
                    max(cid_ccn) AS contact_cid
                FROM mms.mmsccc id_ref
                WHERE
                    SUBSTRING(id_ref.type_ind, 4, 1)='Y'
                    AND
                    cid IN (
                        SELECT permit_cid
                        FROM  permit_contact_list
                        WHERE permit_contact_list.contact_number>1
                    )
                GROUP BY cid
            ),
            --The rest are either with multiple attached contact but non of them
            --are marked as permittee, or with only one attached contact.
            permittee_default_list AS (
                SELECT permit_cid
                FROM permit_contact_list
                WHERE permit_cid NOT IN (
                    SELECT permit_cid
                    FROM permittee_selection
                )
            ),
            permittee_default AS (
                SELECT
                    id_ref.cid AS permit_cid    ,
                    max(id_ref.cid_ccn) AS contact_cid
                FROM mms.mmsccc id_ref
                WHERE cid IN (
                    SELECT permit_cid
                    FROM permittee_default_list
                )
                GROUP BY id_ref.cid
            ),
            --List of permit-permittee id reference
            permit_attached_permittee_list AS (
                SELECT *
                FROM permittee_selection
                UNION
                SELECT *
                FROM permittee_default
            ),
            --List of permittee info from attached contact
            permittee_from_attached_contact AS (
                SELECT
                    permittee_list.permit_cid                       ,
                    contact_info.add_dt ::date AS effective_date    ,
                    company_info.cmp_nm  AS permittee_nm            ,
                    company_info.tel_no                             ,
                    company_info.email                              ,
                    '1'::numeric AS source
                FROM permit_attached_permittee_list permittee_list
                INNER JOIN mms.mmsccn contact_info ON
                    permittee_list.contact_cid=contact_info.cid
                INNER JOIN mms.mmscmp company_info ON
                    contact_info.cmp_cd=company_info.cmp_cd
            ),
            -- Permittee source 2: From company info documented in NoW
            -- Use source 2 for permit record with no permittee contact attached
            permit_list_no_attached_permittee AS (
                SELECT
                    permit_cid
                FROM permit_list
                WHERE permit_cid NOT IN (
                    SELECT permit_cid
                    FROM  permittee_from_attached_contact
                )
            ),
            permittee_from_now_company_info AS (
                SELECT
                    permit_list.permit_cid              ,
                    now.str_dt ::date AS effective_date ,
                    company.cmp_nm AS permittee_nm      ,
                    company.tel_no                      ,
                    company.email                       ,
                    '2'::numeric AS source
                FROM permit_list_no_attached_permittee permit_list
                INNER JOIN mms.mmsnow now ON
                    now.cid=permit_list.permit_cid
                INNER JOIN mms.mmscmp company ON
                    company.cmp_cd = now.cmp_cd
            ),
            -- Permittee source 3: Current permittee from mine_info (mms.mmsmin)
            -- If permit record has no permittee attached or cmp_name in its Now
            -- Use current permittee by default extracted from the mine_info
            permit_list_others AS (
                SELECT permit_cid
                FROM permit_list
                EXCEPT
                (
                    SELECT permit_cid
                    FROM permittee_from_now_company_info
                    UNION
                    SELECT permit_cid
                    FROM permittee_from_attached_contact
                )
            ),
            permittee_from_mine_info AS (
                SELECT
                    permit_info.permit_cid  ,
                    CASE
                        WHEN mine_info.entered_date ~ 'XXXX/XX/XX'
                        THEN current_date
                        ELSE to_date(mine_info.entered_date, 'YYYY/MM/DD')
                    END AS effective_date,
                    mine_info.cmp_nm AS permittee_nm    ,
                    mine_info.ctel_no AS tel_no         ,
                    mine_info.cemail AS email           ,
                    '3'::numeric AS source
                FROM permit_info
                INNER JOIN mms.mmsmin mine_info ON
                    mine_info.mine_no = permit_info.mine_no
                WHERE permit_info.permit_cid IN
                    (
                        SELECT permit_cid
                        FROM  permit_list_others
                    )
            ),
            --Combine permittee info extracted from all 3 source
            permittee_info AS (
                SELECT * FROM permittee_from_attached_contact
                UNION
                SELECT * FROM permittee_from_now_company_info
                UNION
                SELECT * FROM permittee_from_mine_info
            ),
            --Add party_combo_id
            permittee_info_wCombo AS (
                SELECT
                    permit_cid      ,
                    effective_date  ,
                    permittee_nm    ,
                    tel_no          ,
                    email           ,
                    source          ,
                    concat(permittee_nm,tel_no) AS party_combo_id
                FROM permittee_info
            ),
            --New record in MMS that does not exist in MDS ETL table
            permittee_record AS (
                SELECT
                    DISTINCT ON (party_combo_id)
                    gen_random_uuid() AS party_guid,
                    party_combo_id  ,
                    effective_date  ,
                    permittee_nm    ,
                    tel_no          ,
                    email           ,
                    source
                FROM permittee_info_wCombo

            ),
            --Formatting permittee name
            permittee_org AS (
                SELECT
                    party_combo_id            ,
                    party_guid                ,
                    NULL AS first_name        ,
                    permittee_nm AS party_name,
                    'ORG' ::text AS party_type
                FROM permittee_record
                WHERE
                    permittee_nm ~* company_keyword_special
                    OR
                    permittee_nm ~ company_keyword_cs
                    OR
                    permittee_nm ~* company_keyword_ci
            ),
            permittee_person AS (
                SELECT
                    party_combo_id  ,
                    party_guid      ,
                    CASE
                        WHEN permittee_nm ~ ','
                        THEN split_part(permittee_nm,', ',1 )
                        WHEN permittee_nm ~ ' '
                        THEN split_part(permittee_nm,' ', 1 )
                        ELSE NULL
                    END AS first_name,
                    CASE
                        WHEN permittee_nm ~ ','
                        THEN COALESCE(NULLIF(regexp_replace
                        (
                            trim(leading from permittee_nm, split_part(permittee_nm,',', 1 )||', '),
                            ' ', '', 'b'),''),'N/A'
                        )
                        WHEN permittee_nm ~ ' '
                        THEN COALESCE(NULLIF(regexp_replace
                        (
                            trim(leading from permittee_nm, split_part(permittee_nm,' ',1 )||' '),
                            ' ', '', 'b'),''),'N/A'
                        )
                        ELSE permittee_nm
                    END AS party_name,
                    'PER' ::text AS party_type
                FROM permittee_record
                WHERE party_combo_id NOT IN (
                    SELECT party_combo_id
                    FROM permittee_org
                )
            ),
            permittee_name_and_type AS (
                SELECT
                    party_combo_id     ,
                    party_guid         ,
                    first_name::varchar,
                    party_name         ,
                    party_type
                FROM permittee_org
                UNION
                SELECT * FROM permittee_person

            ),
            --Extract only the numbers in phone info field, get rid of special char such as '()'
            permittee_contact_phone_format AS(
                SELECT
                    party_combo_id,
                    NULLIF(regexp_replace(tel_no, '\D', '','g'),'')::numeric phone_no,
                    email
                FROM permittee_record
            ),
            --Format bad phone data, get rid of country code, filter out invalid phone number such as 999999999
            permittee_contact_filter AS(
                SELECT
                    party_combo_id,
                    CASE
                        WHEN phone_no>=10^10 AND phone_no<2*10^10 THEN (phone_no-10^10 )::varchar
                        WHEN phone_no>10^9 AND phone_no<10^10 THEN (phone_no)::varchar
                        ELSE 'Unknown'
                    END AS phone_no,
                    email
                FROM permittee_contact_phone_format
            ),
            --Format phone and email in MDS syntax
            permittee_contact AS (
                SELECT
                    party_combo_id,
                    CASE
                        WHEN filtered.phone_no = 'Unknown' THEN filtered.phone_no
                        ELSE
                            SUBSTRING(filtered.phone_no from 1 for 3)||'-'||
                            SUBSTRING(filtered.phone_no from 4 for 3)||'-'||
                            SUBSTRING(filtered.phone_no from 7 for 4)
                    END AS phone_no,
                    COALESCE(NULLIF(regexp_replace(filtered.email,' ', '', 'g'),''),'Unknown') email
                FROM permittee_contact_filter filtered
            ),
            --Combine the formatted contact info for records
            permittee_wContact AS (
                SELECT
                    permittee.permit_cid             ,
                    permittee.party_combo_id         ,
                    permittee.source                 ,
                    name_and_type.party_guid         ,
                    name_and_type.first_name         ,
                    name_and_type.party_name         ,
                    name_and_type.party_type         ,
                    contact.phone_no                 ,
                    contact.email                    ,
                    COALESCE(permittee.effective_date , now()) AS effective_date
                FROM permittee_info_wCombo permittee
                INNER JOIN permittee_name_and_type name_and_type ON
                    name_and_type.party_combo_id=permittee.party_combo_id
                INNER JOIN permittee_contact contact ON
                    contact.party_combo_id=permittee.party_combo_id
            )
            INSERT INTO all_permit_info (
                mine_party_appt_guid  ,
                --permit info
                permit_guid           ,
                source                ,
                mine_guid             ,
                mine_no               ,
                permit_no             ,
                permit_cid            ,
                received_date         ,
                issue_date            ,
                authorization_end_date,
                permit_status_code    ,
                --permittee info
                party_guid            ,
                party_combo_id        ,
                first_name            ,
                party_name            ,
                party_type            ,
                phone_no              ,
                email                 ,
                effective_date        ,
                new_permit            ,
                new_permittee
            )
            SELECT
                gen_random_uuid()            ,
                --permit info
                gen_random_uuid()            ,
                permittee_info.source        ,
                permit_info.mine_guid        ,
                permit_info.mine_no          ,
                permit_info.permit_no        ,
                permit_info.permit_cid       ,
                permit_info.recv_dt          ,
                permit_info.iss_dt           ,
                permit_info.permit_expiry_dt ,
                permit_info.sta_cd           ,
                --permittee info
                permittee_info.party_guid    ,
                permittee_info.party_combo_id,
                permittee_info.first_name    ,
                permittee_info.party_name    ,
                permittee_info.party_type    ,
                permittee_info.phone_no      ,
                permittee_info.email         ,
                permittee_info.effective_date,
                CASE
                    WHEN permit_info.permit_cid NOT IN (
                        SELECT ETL_PERMIT.permit_cid
                        FROM ETL_PERMIT
                    )
                    THEN TRUE
                    ELSE FALSE
                END AS new_permit           ,
                CASE
                    WHEN permittee_info.party_combo_id NOT IN (
                        SELECT ETL_PERMIT.party_combo_id
                        FROM ETL_PERMIT
                    )
                    THEN TRUE
                    ELSE FALSE
                END AS new_permittee
            FROM permit_info
            INNER JOIN permittee_wContact permittee_info ON
                permittee_info.permit_cid = permit_info.permit_cid;


            -- Update existing records
            RAISE NOTICE '.. Update existing ETL_PERMIT records';
            WITH updated_rows AS (
                UPDATE ETL_PERMIT
                SET
                    --permit info
                    source                 = info.source                ,
                    mine_no                = info.mine_no               ,
                    permit_no              = info.permit_no             ,
                    received_date          = info.received_date         ,
                    issue_date             = info.issue_date            ,
                    authorization_end_date = info.authorization_end_date,
                    permit_status_code     = info.permit_status_code    ,
                    --permittee info
                    party_combo_id         = info.party_combo_id        ,
                    first_name             = info.first_name            ,
                    party_name             = info.party_name            ,
                    party_type             = info.party_type            ,
                    phone_no               = info.phone_no              ,
                    email                  = info.email                 ,
                    effective_date         = info.effective_date
                FROM all_permit_info info
                WHERE
                    ETL_PERMIT.mine_guid = info.mine_guid
                    AND
                    ETL_PERMIT.party_guid = info.party_guid
                    AND
                    ETL_PERMIT.permit_guid = info.permit_guid
                RETURNING 1
            )
            SELECT COUNT(*) FROM updated_rows INTO update_row;
            RAISE NOTICE '....# of records in ETL_PERMIT: %', old_row;
            RAISE NOTICE '....# of records updated in ETL_PERMIT: %', update_row;

            RAISE NOTICE '.. Insert new records into ETL_PERMIT';
            WITH inserted_rows AS (
                INSERT INTO ETL_PERMIT(
                    mine_party_appt_guid,
                    --permit info
                    permit_guid           ,
                    source                ,
                    mine_guid             ,
                    mine_no               ,
                    permit_no             ,
                    permit_cid            ,
                    received_date         ,
                    issue_date            ,
                    authorization_end_date,
                    permit_status_code    ,
                    --permittee info
                    party_combo_id        ,
                    party_guid            ,
                    first_name            ,
                    party_name            ,
                    party_type            ,
                    phone_no              ,
                    email                 ,
                    effective_date
                )
                SELECT
                    gen_random_uuid()          ,
                    --permit info
                    info.permit_guid           ,
                    info.source                ,
                    info.mine_guid             ,
                    info.mine_no               ,
                    info.permit_no             ,
                    info.permit_cid            ,
                    info.received_date         ,
                    info.issue_date            ,
                    info.authorization_end_date,
                    info.permit_status_code    ,
                    --permittee info
                    info.party_combo_id        ,
                    info.party_guid            ,
                    info.first_name            ,
                    info.party_name            ,
                    info.party_type            ,
                    info.phone_no              ,
                    info.email                 ,
                    info.effective_date
                FROM all_permit_info info
                WHERE
                    info.new_permit = TRUE
                    AND
                    info.new_permittee = TRUE
                RETURNING 1
            )
            SELECT count(*) FROM inserted_rows INTO insert_row;
            SELECT count(*) FROM ETL_PERMIT INTO total_row;
            RAISE NOTICE '.... # of new permit records loaded into ETL_PERMIT: %', insert_row;
            RAISE NOTICE '....Total records in ETL_PERMIT: %.', total_row;

            DROP TABLE IF EXISTS all_permit_info;
        END;

        DECLARE
            old_row  integer;
            update_row integer;
            insert_row integer;
            total_row  integer;
        BEGIN
            RAISE NOTICE '.. Step 2 of 4: Update permit info';
            SELECT count(*) FROM permit INTO old_row;

            -- Upsert permit data from ETL_PERMIT
            RAISE NOTICE '.. Update existing records with latest MMS data';
            WITH updated_rows AS (
            UPDATE permit
            SET
                received_date          = etl.received_date         ,
                issue_date             = etl.issue_date            ,
                update_user            = 'mms_migration'           ,
                update_timestamp       = now()                     ,
                authorization_end_date = etl.authorization_end_date,
                permit_status_code     = etl.permit_status_code
            FROM ETL_PERMIT etl
            WHERE
                permit.mine_guid = etl.mine_guid
                AND
                permit.permit_guid = etl.permit_guid
            RETURNING 1
            )
            SELECT COUNT(*) FROM updated_rows INTO update_row;
            RAISE NOTICE '....# of records in permit: %', old_row;
            RAISE NOTICE '....# of records updated in permit: %', update_row;

            RAISE NOTICE '.. Insert new MMS ETL_PERMIT records into permit';
            WITH
            --Select only new entry in ETL_PERMIT table
            new_permit AS (
                SELECT *
                FROM ETL_PERMIT
                WHERE permit_guid NOT IN (
                    SELECT permit_guid
                    FROM permit
                )
            ), inserted_rows AS (
                INSERT INTO permit (
                    permit_guid         ,
                    mine_guid           ,
                    permit_no           ,
                    received_date       ,
                    issue_date          ,
                    permit_status_code  ,
                    create_user         ,
                    create_timestamp    ,
                    update_user         ,
                    update_timestamp    ,
                    authorization_end_date
                )
                SELECT
                    new_permit.permit_guid         ,
                    new_permit.mine_guid           ,
                    new_permit.permit_no           ,
                    new_permit.received_date       ,
                    new_permit.issue_date          ,
                    new_permit.permit_status_code  ,
                    'mms_migration'                ,
                    now()                          ,
                    'mms_migration'                ,
                    now()                          ,
                    new_permit.authorization_end_date
                FROM new_permit
                INNER JOIN ETL_MINE ON
                    new_permit.mine_guid = ETL_MINE.mine_guid
                RETURNING 1
            )
            SELECT COUNT(*) FROM inserted_rows INTO insert_row;
            SELECT COUNT(*) FROM permit INTO total_row;
            RAISE NOTICE '.... # of new permit records loaded into MDS: %', insert_row;
            RAISE NOTICE '.... # of total permit records in MDS: %', total_row;
        END;

        DECLARE
            old_row  integer;
            update_row integer;
            insert_row integer;
            total_row  integer;
        BEGIN
            RAISE NOTICE '.. Step 3 of 4: Update party info';
            SELECT count(*) FROM party INTO old_row;


            -- Upsert permit data from ETL_PERMIT
            RAISE NOTICE '.. Update existing records with latest MMS data';
            WITH updated_rows AS (
            UPDATE party
            SET
                first_name       = etl.first_name            ,
                party_name       = etl.party_name            ,
                phone_no         = etl.phone_no              ,
                email            = etl.email                 ,
                effective_date   = etl.effective_date        ,
                expiry_date      = etl.authorization_end_date,
                update_user      = 'mms_migration'           ,
                update_timestamp = now()                     ,
                party_type_code  = etl.party_type
            FROM ETL_PERMIT etl
            WHERE party.party_guid = etl.party_guid
            RETURNING 1
            )
            SELECT COUNT(*) FROM updated_rows INTO update_row;
            RAISE NOTICE '....# of records in party: %', old_row;
            RAISE NOTICE '....# of records updated in party: %', update_row;

            RAISE NOTICE '.. Insert new MMS ETL_PERMIT records into party';
            WITH
            --Select only new entry in ETL_PERMIT table
            new_party AS (
                SELECT DISTINCT ON (party_guid)
                    party_guid            ,
                    first_name            ,
                    party_name            ,
                    phone_no              ,
                    email                 ,
                    effective_date        ,
                    authorization_end_date,
                    party_type
                FROM ETL_PERMIT
                WHERE party_guid NOT IN (
                    SELECT  party_guid
                    FROM    party
                )
            ), inserted_rows AS (
                INSERT INTO party (
                    party_guid       ,
                    first_name       ,
                    party_name       ,
                    phone_no         ,
                    email            ,
                    effective_date   ,
                    expiry_date      ,
                    create_user      ,
                    create_timestamp ,
                    update_user      ,
                    update_timestamp ,
                    -- ignore middle name as such info does not exist in MMS
                    party_type_code
                )
                SELECT
                    party_guid            ,
                    first_name            ,
                    party_name            ,
                    phone_no              ,
                    email                 ,
                    effective_date        ,
                    authorization_end_date,
                    'mms_migration'       ,
                    now()                 ,
                    'mms_migration'       ,
                    now()                 ,
                    party_type
                FROM new_party
                RETURNING 1
            )
            SELECT COUNT(*) FROM inserted_rows INTO insert_row;
            SELECT COUNT(*) FROM party INTO total_row;
            RAISE NOTICE '.... # of new party records loaded into MDS: %', insert_row;
            RAISE NOTICE '.... # of total party records in MDS: %', total_row;
        END;

        DECLARE
            old_row    integer;
            update_row integer;
            insert_row integer;
            delete_row integer;
            total_row  integer;
        BEGIN
            RAISE NOTICE '.. Step 4 of 4: Update party_appt info';
            SELECT count(*) FROM mine_party_appt INTO old_row;

            RAISE NOTICE '..Purge mine_party_appts from ETL mines';
            RAISE NOTICE '....# of records in mine_party_appt: %', old_row;
            WITH deleted_rows AS (
                DELETE FROM mine_party_appt
                WHERE
                    -- Only records known to ETL_PERMIT
                    CONCAT(mine_guid, party_guid, permit_guid) IN (
                        SELECT CONCAT(mine_guid, party_guid, permit_guid)
                        FROM ETL_PERMIT
                    )
                    -- Only on mines in ETL process
                    AND
                    mine_guid IN (
                        SELECT mine_guid
                        FROM ETL_MINE
                    )
                    -- Only permit records
                    AND permit_guid IS NOT NULL
                RETURNING 1
            )
            SELECT COUNT(*) FROM deleted_rows INTO delete_row;
            SELECT count(*) FROM mine_party_appt INTO old_row;
            RAISE NOTICE '....# of records removed from mine_party_appt: %', delete_row;
            RAISE NOTICE '....# of records remaining in mine_party_appt: %', old_row;

            RAISE NOTICE '.. Insert latest MMS records from ETL_PERMIT into mine_party_appt';
            WITH inserted_rows AS (
                INSERT INTO mine_party_appt (
                    mine_party_appt_guid     ,
                    permit_guid              ,
                    party_guid               ,
                    mine_guid                ,
                    mine_party_appt_type_code,
                    create_user              ,
                    create_timestamp         ,
                    update_user              ,
                    update_timestamp         ,
                    start_date               ,
                    end_date                 ,
                    processed_by             ,
                    processed_on
                )
                SELECT
                    ETL_PERMIT.mine_party_appt_guid,
                    ETL_PERMIT.permit_guid         ,
                    ETL_PERMIT.party_guid          ,
                    ETL_PERMIT.mine_guid           ,
                    'PMT'                          ,
                    'mms_migration'                ,
                    now()                          ,
                    'mms_migration'                ,
                    now()                          ,
                    issue_date                     ,
                    authorization_end_date         ,
                    'mms_migration'                ,
                    now()
                FROM ETL_PERMIT
                INNER JOIN ETL_MINE ON
                    ETL_PERMIT.mine_guid = ETL_MINE.mine_guid
                RETURNING 1
            )
            SELECT count(*) FROM inserted_rows INTO insert_row;
            SELECT count(*) FROM mine_party_appt INTO total_row;
            RAISE NOTICE '.... # new permittee records loaded into MDS: %', insert_row;
            RAISE NOTICE '.... Total permittee records in MDS: %', total_row;
            RAISE NOTICE 'Finish updating permits and permittees.';
        END;
    END; 
$$LANGUAGE plpgsql;

CREATE FUNCTION transfer_mine_status_information() RETURNS void AS $$
    BEGIN
        DECLARE
            old_row    integer;
            new_row    integer;
            update_row integer;
        BEGIN
            RAISE NOTICE 'Start updating mine status:';
            RAISE NOTICE '.. Step 1 of 2: Scan new mine records in MMS';
            -- This is the intermediary table that will be used to store valid mine status data from MMS
            CREATE TABLE IF NOT EXISTS ETL_STATUS (
                mine_guid             uuid       ,
                mine_no               varchar(7) ,
                status_code           varchar(10)
            );
            SELECT count(*) FROM ETL_STATUS into old_row;

            -- Upsert data into ETL_STATUS from MMS
            RAISE NOTICE '.. Update existing records with latest MMS data';
            UPDATE ETL_STATUS
            SET status_code = CASE mms.mmsmin.sta_cd
                                WHEN 'B' THEN 'ABN'
                                ELSE NULL
                            END
            FROM mms.mmsmin, ETL_MINE
            WHERE
                mms.mmsmin.mine_no = ETL_MINE.mine_no
                AND
                -- NULL is not a valid mine status option (no matching mine_status_xref record)
                (CASE sta_cd
                    WHEN 'B' THEN 'ABN'
                    ELSE NULL
                END)
                    IS NOT NULL;
            SELECT count(*) FROM ETL_STATUS, mms.mmsmin WHERE ETL_STATUS.mine_no = mms.mmsmin.mine_no INTO update_row;
            RAISE NOTICE '....# of mine records in ETL_STATUS: %', old_row;
            RAISE NOTICE '....# of mine records updated in ETL_STATUS: %', update_row;

            RAISE NOTICE '.. Insert new MMS mine records into ETL_STATUS';
            WITH mms_new AS(
                SELECT *
                FROM mms.mmsmin
                WHERE NOT EXISTS (
                    SELECT  1
                    FROM    ETL_STATUS
                    WHERE   ETL_STATUS.mine_no = mms.mmsmin.mine_no
                )
            )
            INSERT INTO ETL_STATUS (
                mine_guid  ,
                mine_no    ,
                status_code)
            SELECT
                ETL_MINE.mine_guid,
                ETL_MINE.mine_no  ,
                CASE mms_new.sta_cd
                    WHEN 'B' THEN 'ABN'
                    ELSE NULL
                END
            FROM mms_new, ETL_MINE
            WHERE
                ETL_MINE.mine_no = mms_new.mine_no
                AND
                -- NULL is not a valid mine status option (no matching mine_status_xref record)
                (CASE sta_cd
                    WHEN 'B' THEN 'ABN'
                    ELSE NULL
                END) 
                    IS NOT NULL;
            SELECT count(*) FROM ETL_STATUS INTO new_row;
            RAISE NOTICE '....# of new mine records found in MMS: %', (new_row-old_row);
            RAISE NOTICE '....Total mine records in ETL_STATUS: %.', new_row;
        END;
        
        DECLARE
            old_row    integer;
            new_row    integer;
            update_row integer;
        BEGIN
            RAISE NOTICE '.. Step 2 of 2: Update mine statuses in MDS';
            SELECT count(*) FROM mine_status into old_row;

            -- Upsert data from MMS into mine_status
            RAISE NOTICE '.. Update existing records with latest MMS data';
            UPDATE mine_status
            SET mine_status_xref_guid = xref.mine_status_xref_guid,
                update_user           = 'mms_migration'           ,
                update_timestamp      = now()
            -- ETL_STATUS knows the mine_guid & status_code
            -- mine_status knows the mine_guid & mine_status_xref_guid
            -- mine_status_xref knows the mine_status_xref_guid & status_code as mine_operation_status_code
            FROM ETL_STATUS, mine_status_xref xref
            WHERE
                -- Matching mine
                ETL_STATUS.mine_guid = mine_status.mine_guid
                AND
                -- Matching xref record
                ETL_STATUS.status_code = xref.mine_operation_status_code;
            SELECT count(*) FROM mine_status, ETL_STATUS WHERE mine_status.mine_guid = ETL_STATUS.mine_guid INTO update_row;
            RAISE NOTICE '....# of mine_status records in MDS: %', old_row;
            RAISE NOTICE '....# of mine_status records updated in MDS: %', update_row;

            RAISE NOTICE '.. Insert new ETL_STATUS records into mine_status';
            WITH new_record AS(
                SELECT *
                FROM ETL_STATUS
                WHERE NOT EXISTS (
                    SELECT  1
                    FROM    mine_status
                    WHERE   mine_status.mine_guid = ETL_STATUS.mine_guid
                )
            )
            INSERT INTO mine_status(
                mine_status_guid     ,
                mine_guid            ,
                mine_status_xref_guid,
                create_user          ,
                create_timestamp     ,
                update_user          ,
                update_timestamp     )
            SELECT
                gen_random_uuid()         ,
                new_record.mine_guid      ,
                xref.mine_status_xref_guid,
                'mms_migration'           ,
                now()                     ,
                'mms_migration'           ,
                now()
            FROM new_record, mine_status_xref xref
            -- JOIN on xref with matching "top level" status option
            WHERE new_record.status_code = xref.mine_operation_status_code;
            SELECT count(*) FROM mine_status into new_row;
            RAISE NOTICE '....# of new mine status records loaded into MDS: %.', (new_row-old_row);
            RAISE NOTICE '....Total mine status records in the MDS: %.', new_row;
            RAISE NOTICE 'Finish updating mine status in MDS';
        END;
    END; 
$$LANGUAGE plpgsql;