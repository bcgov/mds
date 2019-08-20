/***
This migration only runs successfully if there is already a postgres foreign data wrapper connection
with the assumptions listed below:

- Valid server connection to the Foreign MMS DB (oracle_fdw)
- Existing database user (mds)
- Foreign schema reader role (fdw_reader)
- Existing schemas being imported (APP_MMS_INTERFACE, VFCMMSINTERFACE)

If you would like more information on how the foreign data wrapper works for this project,
take a look at https://github.com/bcgov/openshift-postgresql-oracle_fdw

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