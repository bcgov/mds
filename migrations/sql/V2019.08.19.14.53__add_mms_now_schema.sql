/***
This migration assumes the base postgres image is using postgresql_fdw_wrapper installation.
https://github.com/bcgov/openshift-postgresql-oracle_fdw

Which ensures you have the following things pre-defined and exist on DB startup:
- Server connection to the Foreign DB (oracle_fdw)
- Database user that requires the access (mds)
- Foreign schema reader role (fdw_reader)
***/

DO
$$
BEGIN
    IF EXISTS(select from pg_foreign_server where srvname = 'oracle_fdw') THEN
        DROP SCHEMA IF EXISTS mms_now_nros;
        CREATE SCHEMA mms_now_nros;
        IMPORT FOREIGN SCHEMA "APP_MMS_INTERFACE" FROM SERVER oracle_fdw INTO mms_now_nros;
        GRANT USAGE ON SCHEMA mms_now_nros TO fdw_reader;
        GRANT SELECT ON ALL TABLES IN SCHEMA mms_now_nros TO fdw_reader;
        GRANT fdw_reader to "mds";

        DROP SCHEMA IF EXISTS mms_now_vfcbc;
        CREATE SCHEMA mms_now_vfcbc;
        IMPORT FOREIGN SCHEMA "VFCMMSINTERFACE" FROM SERVER oracle_fdw INTO mms_now_vfcbc;
        GRANT USAGE ON SCHEMA mms_now_vfcbc TO fdw_reader;
        GRANT SELECT ON ALL TABLES IN SCHEMA mms_now_vfcbc TO fdw_reader;
        GRANT fdw_reader to "mds";
    END IF;
END
$$;