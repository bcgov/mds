import os
import re
from dotenv import load_dotenv, find_dotenv
import psycopg2
import cx_Oracle

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

SRC_DB_HOST = os.environ.get('SRC_DB_HOST')
SRC_DB_USER = os.environ.get('SRC_DB_USER')
SRC_DB_PASS = os.environ.get('SRC_DB_PASS')
SRC_DB_PORT = os.environ.get('SRC_DB_PORT')
SRC_DB_NAME = os.environ.get('SRC_DB_NAME')

TGT_DB_HOST = os.environ.get('TGT_DB_HOST')
TGT_DB_USER = os.environ.get('TGT_DB_USER')
TGT_DB_PASS = os.environ.get('TGT_DB_PASS')
TGT_DB_PORT = os.environ.get('TGT_DB_PORT')
TGT_DB_NAME = os.environ.get('TGT_DB_NAME')


def now_streamline_etl():

    print('Beginning mmsstream_now import...')
    import_complete = False

    try:
        dsn_tns = cx_Oracle.makedsn(SRC_DB_HOST, SRC_DB_PORT, service_name=SRC_DB_NAME)
        oracle_db = cx_Oracle.connect(user=SRC_DB_USER, password=SRC_DB_PASS, dsn=dsn_tns)

        cursor = oracle_db.cursor()

        select_statement = """select 
            cid as mms_cid,
            case when pmt_typ = 'N' then 'New Permit' else 'Amendment' end as typeofapplication,
            exp_desc as descexplorationprogram,
            trim(regexp_substr(comm_desc, '^.*([[:blank:]]{2}|$)', 1, 1)) AS firstaidequipmentonsite,
            trim(regexp_substr(comm_desc, '[[:blank:]]{2}.*$', 1, 1)) AS firstaidcertlevel,
            concat(ten_nos1, ten_nos2) as tenurenumbers,
            concat(cg_clms1, cg_clms2) as crowngrantlotnumbers,
            concat(legal_desc1, legal_desc2) as landlegaldesc,
            case when priv_ind = 1 then 'Yes' else 'No' end as landprivate,
            case when water_ind = 1 then 'Yes' else 'No' end as landcommunitywatershed,
            case when culture_ind = 1 then 'Yes' else 'No' end as archsiteaffected,
            case when fuel_ind = 1 then 'Yes' else 'No' end as fuellubstoreonsite,
            ltr_amt as fuellubstored,
            case when barrel_ind = 1 then 'Yes' else 'No' end as fuellubstoremethodbarrel,
            case when bulk_ind = 1 then 'Yes' else 'No' end as fuellubstoremethodbulk
        from mmsadmin.mmsstream_now mn
        """

        cursor.execute(select_statement)
        results = cursor.fetchall()
        import_complete = True
    finally:
        oracle_db.close()

    if import_complete is False or results is None:
        raise Exception("No values retrieved from mmsstream_now table")

    print(f'Retrieved {len(results)} records.')

    print('Stripping null bytes')

    processed_results = []
    for record in results:
        processed_results.append(
            tuple(i.replace("\00", "") if isinstance(i, str) else i for i in record))

    connection = psycopg2.connect(
        host=TGT_DB_HOST,
        port=TGT_DB_PORT,
        user=TGT_DB_USER,
        password=TGT_DB_PASS,
        dbname=TGT_DB_NAME)
    try:
        cursor = connection.cursor()

        print('Creating temporary table and inserting records...')
        cursor.execute("""CREATE TEMP TABLE IF NOT EXISTS temp_streamline (
            mms_cid bigint,
            typeofapplication varchar, 
            descexplorationprogram varchar,
            firstaidequipmentonsite varchar,
            firstaidcertlevel varchar,
            tenurenumbers varchar,
            crowngrantlotnumbers varchar,
            landlegaldesc varchar,
            landprivate varchar,
            landcommunitywatershed varchar,
            archsitesaffected varchar,
            fuellubstoreonsite varchar,
            fuellubstored int4,
            fuellubstoremethodbarrel varchar,
            fuellubstoremethodbulk varchar
            )
        """)

        cursor.execute("TRUNCATE TABLE temp_streamline")

        from psycopg2.extras import execute_values
        execute_values(
            cursor, """INSERT INTO temp_streamline (mms_cid,
            typeofapplication, 
            descexplorationprogram,
            firstaidequipmentonsite,
            firstaidcertlevel,
            tenurenumbers,
            crowngrantlotnumbers,
            landlegaldesc,
            landprivate,
            landcommunitywatershed,
            archsitesaffected,
            fuellubstoreonsite,
            fuellubstored,
            fuellubstoremethodbarrel,
            fuellubstoremethodbulk) VALUES %s""", processed_results)

        print('Updating records the now_submissions schema')
        update_statement = """update mms_now_submissions.application a
        set
            typeofapplication = ts.typeofapplication,
            descexplorationprogram = ts.descexplorationprogram,
            firstaidequipmentonsite = ts.firstaidequipmentonsite,
            firstaidcertlevel = ts.firstaidcertlevel,
            tenurenumbers = ts.tenurenumbers,
            crowngrantlotnumbers = ts.crowngrantlotnumbers,
            landlegaldesc = ts.landlegaldesc,
            landprivate = ts.landprivate,
            landcommunitywatershed = ts.landcommunitywatershed,
            archsitesaffected = ts.archsitesaffected,
            fuellubstoreonsite = ts.fuellubstoreonsite,
            fuellubstored = ts.fuellubstored,
            fuellubstoremethodbarrel = ts.fuellubstoremethodbarrel,
            fuellubstoremethodbulk = ts.fuellubstoremethodbulk
        from temp_streamline ts
        where a.mms_cid = ts.mms_cid
        """
        cursor.execute(update_statement)
        updated_rows = cursor.rowcount
        connection.commit()

        print('Update complete -  %s records', updated_rows)
    finally:
        connection.close()


if __name__ == '__main__':
    now_streamline_etl()
