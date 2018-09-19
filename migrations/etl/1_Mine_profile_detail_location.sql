-- 1. Migrate MINE PROFILE (mine name, mumber, lat/long)
-- Create the ETL_PROFILE table
<<<<<<< HEAD


DO $$
DECLARE 
    old_row   integer;
    new_row   integer;
BEGIN 
    RAISE NOTICE 'Start updating mine profile:';
    RAISE NOTICE '.. Step 1 of 3: Scan new mine records in MMS';
    SELECT count(*) FROM ETL_PROFILE into old_row;
    -- This is the intermediary table that will be used to store mine profile from the MMS database.
    CREATE TABLE IF NOT EXISTS ETL_PROFILE (
        mine_guid uuid          ,
        mine_no   varchar(7)    ,
        mine_nm   varchar(60)   ,
        lat_dec   numeric(9,7)  ,
        lon_dec  numeric(11,7)
    );
    -- Upsert data into ETL_PROFILE from MMS
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
        lat_dec         ,
        lon_dec         )
    SELECT
        gen_random_uuid()       ,
        mms_new.mine_no    ,
        mms_new.mine_nm    ,
        mms_new.lat_dec    ,
        mms_new.lon_dec
    FROM mms_new;
    SELECT count(*) FROM ETL_PROFILE INTO new_row; 
    RAISE NOTICE '....# of new mine record found in MMS: %', (new_row-old_row);
  
END $$;




DO $$
DECLARE 
    old_row         integer;
    new_row         integer;
    location_row    integer;
BEGIN
    RAISE NOTICE '.. Step 2 of 2: Update mine details in MDS';
    SELECT count(*) FROM mine_detail into old_row;
    -- Upsert data from new_record into mine_identity table
    WITH new_record AS (
        SELECT *
        FROM ETL_PROFILE
        WHERE NOT EXISTS (
            SELECT  1
            FROM    mine_identity
            WHERE   mine_guid = ETL_PROFILE.mine_guid
        )
    )
    INSERT INTO mine_identity(
        mine_guid           ,
        create_user         ,
        create_timestamp    ,
        update_user         ,
        update_timestamp    )
    SELECT
        new.mine_guid       ,
        'mms.migration'     ,
        now()               ,
        'mms_migration'     ,
        now()
    FROM new_record new; 
    -- Upsert data from new_record into mine_detail
    WITH new_record AS (
        SELECT *
        FROM ETL_PROFILE
        WHERE NOT EXISTS (
            SELECT  1
            FROM    mine_detail
            WHERE   mine_guid = ETL_PROFILE.mine_guid
        )
    )
    INSERT INTO mine_detail(
        mine_detail_guid    ,
        mine_guid           ,
        mine_no             ,
        mine_name           ,
        effective_date      ,
        expiry_date         ,
        create_user         ,
        create_timestamp    ,
        update_user         ,
        update_timestamp    )
    SELECT
        gen_random_uuid()   ,
        new.mine_guid       ,
        new.mine_no         ,
        new.mine_nm         ,
        now()               ,
        '9999-12-31'::date	,
        'mms_migration'     ,
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
    )
    INSERT INTO mine_location(
        mine_location_guid  ,
        mine_guid           ,
        latitude            ,
        longitude           ,
        effective_date      ,
        expiry_date         ,
        create_user         ,
        create_timestamp    ,
        update_user         ,
        update_timestamp    )
    SELECT
        gen_random_uuid()   ,
        new.mine_guid       ,
        new.lat_dec         ,
        new.lon_dec         ,
        now()               ,
        '9999-12-31'::date	,
        'mms_migration'     ,
        now()               ,
        'mms_migration'     ,
        now()
    FROM new_record new
    WHERE
        (new.lat_dec IS NOT NULL AND new.lon_dec IS NOT NULL)
        AND
        (new.lat_dec <> 0 AND new.lon_dec <> 0); 
    SELECT count(*) FROM mine_detail into new_row;
    SELECT count(*) FROM mine_location into location_row;
    RAISE NOTICE '....# of new mine records loaded into MDS: %.', (new_row-old_row);
    RAISE NOTICE '....Total mine records in the MDS: %.', new_row;
    RAISE NOTICE '....Total mine records with location info in the MDS: %.', location_row;
    RAISE NOTICE 'Finish updating mine list in MDS';
END $$;






 

=======
/*
This is the intermediary table that will be used to
store mine profile from the MMS database.
*/
CREATE TABLE IF NOT EXISTS ETL_PROFILE (
    mine_guid uuid          ,
    mine_no   varchar(7)    ,
    mine_nm   varchar(60)   ,
    lat_dec   numeric(9,7)  ,
    lon_dec  numeric(11,7)
);
-- Upsert data into ETL_PROFILE from MMS
-- If new rows have been added since the last ETL, only insert the new ones.
-- Generate a random UUID for mine_guid
INSERT INTO ETL_PROFILE (
    mine_guid       ,
    mine_no         ,
    mine_nm         ,
    lat_dec         ,
    lon_dec         )
SELECT
    gen_random_uuid()       ,
    mine_profile.mine_no    ,
    mine_profile.mine_nm    ,
    mine_profile.lat_dec    ,
    mine_profile.lon_dec
FROM mms.mmsmin mine_profile
WHERE NOT EXISTS (
    SELECT  1
    FROM    ETL_PROFILE
    WHERE   mine_no = mine_profile.mine_no);

--Temp table to store only records in ETL_PROFILE that does not exist in mine_details
DROP TABLE IF EXISTS new_profile;
CREATE TEMP TABLE new_profile AS
(
    SELECT *
    FROM ETL_PROFILE
    WHERE NOT EXISTS (
        SELECT  1
        FROM    mine_detail
        WHERE   mine_guid = ETL_PROFILE.mine_guid
    )
);
-- Upsert data from new_record into mine_identity table
INSERT INTO mine_identity(
    mine_guid           ,
    create_user         ,
    create_timestamp    ,
    update_user         ,
    update_timestamp    )
SELECT
    new.mine_guid       ,
    'mms.migration'     ,
    now()               ,
    'mms_migration'     ,
    now()
FROM new_profile new;
-- Upsert data from new_record into mine_detail
INSERT INTO mine_detail(
    mine_detail_guid    ,
    mine_guid           ,
    mine_no             ,
    mine_name           ,
    effective_date      ,
    expiry_date         ,
    create_user         ,
    create_timestamp    ,
    update_user         ,
    update_timestamp    )
SELECT
    gen_random_uuid()   ,
    new.mine_guid       ,
    new.mine_no         ,
    new.mine_nm         ,
    now()               ,
    '9999-12-31'::date	,
    'mms_migration'     ,
    now()               ,
    'mms_migration'     ,
    now()
FROM new_profile new;

--Temp table to store only records in ETL that does not exist in mine_location
DROP TABLE IF EXISTS new_location;
CREATE TEMP TABLE new_location AS
(
    SELECT *
    FROM ETL_PROFILE
    WHERE NOT EXISTS (
        SELECT  1
        FROM    mine_location
        WHERE   mine_no = ETL_PROFILE.mine_no
    )
);
-- Upsert data from new_record into mine_location
INSERT INTO mine_location(
    mine_location_guid  ,
    mine_guid           ,
    latitude            ,
    longitude           ,
    effective_date      ,
    expiry_date         ,
    create_user         ,
    create_timestamp    ,
    update_user         ,
    update_timestamp    )
SELECT
    gen_random_uuid()   ,
    new.mine_guid       ,
    new.lat_dec         ,
    new.lon_dec         ,
    now()               ,
    '9999-12-31'::date	,
    'mms_migration'     ,
    now()               ,
    'mms_migration'     ,
    now()
FROM new_profile new
WHERE
    (new.lat_dec IS NOT NULL AND new.lon_dec IS NOT NULL)
    AND
    (new.lat_dec <> 0 AND new.lon_dec <> 0); 
>>>>>>> 39f2d731dcb198e53063ce6147a06694d616b0aa


