-- Drop and recreate FDW schemas
IF EXISTS(select from pg_foreign_server where srvname = 'oracle_fdw') THEN
    DROP SCHEMA IF EXISTS mms;
    CREATE SCHEMA mms;
    IMPORT FOREIGN SCHEMA "MMSADMIN" FROM SERVER oracle_fdw INTO mms;
    GRANT USAGE ON SCHEMA mms TO fdw_reader;
    GRANT SELECT ON ALL TABLES IN SCHEMA mms TO fdw_reader;

    DROP SCHEMA IF EXISTS mms_now_nros;
    IMPORT FOREIGN SCHEMA "APP_MMS_INTERFACE" FROM SERVER oracle_fdw INTO mms_now_nros;
    GRANT USAGE ON SCHEMA mms_now_nros TO fdw_reader;
    GRANT SELECT ON ALL TABLES IN SCHEMA mms_now_nros TO fdw_reader;
    GRANT fdw_reader to "mds";

    DROP SCHEMA IF EXISTS mms_now_vfcbc;
    IMPORT FOREIGN SCHEMA "VFCMMSINTERFACE" FROM SERVER oracle_fdw INTO mms_now_vfcbc;
    GRANT USAGE ON SCHEMA mms_now_vfcbc TO fdw_reader;
    GRANT SELECT ON ALL TABLES IN SCHEMA mms_now_vfcbc TO fdw_reader;
    GRANT fdw_reader to "mds";
END IF;