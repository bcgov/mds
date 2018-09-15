-- 1. Migrate MINE PROFILE (mine name, mumber, lat/long)


-- Create the ETL_PROFILE table
/*
This is the intermediary table that will be used to
store data from the MMS database.
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
    gen_random_uuid()   ,
    mine_profile.mine_no      ,
    mine_profile.mine_nm      ,
    mine_profile.lat_dec      ,
    mine_profile.lon_dec
FROM mms.mmsmin mine_profile
WHERE NOT EXISTS (
    SELECT  1
    FROM    ETL_PROFILE
    WHERE   mine_no = mine_profile.mine_no);

-- Upsert data from ETL_PROFILE into mine_identity table
INSERT INTO mine_identity(
    mine_guid           ,
    create_user         ,
    create_timestamp    ,
    update_user         ,
    update_timestamp    )
SELECT
    ETL_PROFILE.mine_guid   ,
    'mms.migration'         ,
    now()                   ,
    'mms_migration'         ,
    now()
FROM ETL_PROFILE
WHERE NOT EXISTS (
    SELECT  1
    FROM    mine_detail
    WHERE   mine_no = ETL_PROFILE.mine_no);

-- Upsert data from ETL_PROFILE into mine_detail
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
    gen_random_uuid()       ,
    ETL_PROFILE.mine_guid   ,
    ETL_PROFILE.mine_no     ,
    ETL_PROFILE.mine_nm     ,
    now()               ,
    '9999-12-31'::date	,
    'mms'               ,
    now()               ,
    'mms'               ,
    now()
FROM ETL_PROFILE
WHERE NOT EXISTS (
    SELECT  1
    FROM    mine_detail
    WHERE   mine_no = ETL_PROFILE.mine_no);

-- Upsert data from ETL_PROFILE into mine_location
WITH new_record AS
(
    SELECT *
    FROM ETL_PROFILE
    WHERE NOT EXISTS (
        SELECT  1
        FROM    mine_location
        WHERE   mine_no = ETL_PROFILE.mine_no)

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
    'mms'               ,
    now()               ,
    'mms'               ,
    now()
FROM new_record new
WHERE
    (new.lat_dec IS NOT NULL AND new.lon_dec IS NOT NULL)
    AND
    (new.lat_dec <> 0 AND new.lon_dec <> 0);