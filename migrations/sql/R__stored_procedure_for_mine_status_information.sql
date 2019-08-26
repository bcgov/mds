CREATE OR REPLACE FUNCTION transfer_mine_status_information() RETURNS void AS $$
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
            -- ETL_STATUS is stateful and persists between runs, so it must be altered
            ALTER TABLE ETL_STATUS ADD COLUMN legacy_mms_mine_status character varying(50);
            SELECT count(*) FROM ETL_STATUS into old_row;

            -- Upsert data into ETL_STATUS from MMS
            RAISE NOTICE '.. Update existing records with latest MMS data';
            UPDATE ETL_STATUS
            SET status_code = CASE mms.mmsmin.sta_cd
                                  WHEN 'B' THEN 'ABN'
                                  ElSE NULL
                              END,
                legacy_mms_mine_status = mms.mmsmin_sts.min_sts_nm
            FROM mms.mmsmin, mms.mmsmin_sts
            WHERE
                mms.mmsmin.mine_no = ETL_STATUS.mine_no
                AND mms.mmsmin_sts.min_sts_cd = mms.mmsmin.sta_cd;
            SELECT count(*) FROM ETL_STATUS, mms.mmsmin WHERE ETL_STATUS.mine_no = mms.mmsmin.mine_no INTO update_row;
            RAISE NOTICE '....# of mine records in ETL_STATUS: %', old_row;
            RAISE NOTICE '....# of mine records updated in ETL_STATUS: %', update_row;

            RAISE NOTICE '.. Insert new MMS mine records into ETL_STATUS';
            WITH mms_new AS(
                SELECT *
                FROM mms.mmsmin, mms.mmsmin_sts
                WHERE mms.mmsmin.sta_cd = mms.mmsmin_sts.min_sts_cd
                AND NOT EXISTS (
                    SELECT  1
                    FROM    ETL_STATUS
                    WHERE   ETL_STATUS.mine_no = mms.mmsmin.mine_no
                )
            )
            INSERT INTO ETL_STATUS (
                mine_guid  ,
                mine_no    ,
                status_code,
                legacy_mms_mine_status)
            SELECT
                ETL_MINE.mine_guid,
                ETL_MINE.mine_no  ,
                CASE mms_new.sta_cd
                    WHEN 'B' THEN 'ABN'
                    ELSE NULL
                END,
                mms_new.min_sts_nm
            FROM mms_new, ETL_MINE
            WHERE
                ETL_MINE.mine_no = mms_new.mine_no;
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


            -- Upsert data from MMS into mine
            UPDATE mine
            SET legacy_mms_mine_status = ETL_STATUS.legacy_mms_mine_status,
                update_user           = 'mms_migration'           ,
                update_timestamp      = now()
            FROM ETL_STATUS
            WHERE
                -- Matching mine and only changed records
                ETL_STATUS.mine_guid = mine.mine_guid
                AND (ETL_STATUS.legacy_mms_mine_status != mine.legacy_mms_mine_status
                    OR  mine.legacy_mms_mine_status IS NULL);

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
                ETL_STATUS.status_code = xref.mine_operation_status_code
                AND
                -- NULL is not a valid mine status option (no matching mine_status_xref record)
                ETL_STATUS.status_code IS NOT NULL;
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
