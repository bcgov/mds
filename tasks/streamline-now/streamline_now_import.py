import re

from flask import current_app

from xml.etree import ElementTree as ET
from app.extensions import db

import os
from dotenv import load_dotenv, find_dotenv
import psycopg2

from NOW_import import NOW_submissions_ETL
from mms_now_import import mms_now_submissions_ETL
from create_now_identities import create_and_update_now_identities
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


def etl_streamline_now():

    print('Beginning mmsstream_now import')
    import_complete = False

    try:
        dsn_tns = cx_Oracle.makedsn(
            current_app.config['SRC_DB_HOST'],
            current_app.config['SRC_DB_PORT'],
            service_name=current_app.config['SRC_DB_NAME'])
        oracle_db = cx_Oracle.connect(
            user=current_app.config['SRC_DB_USER'],
            password=current_app.config['SRC_DB_PASS'],
            dsn=dsn_tns)

        cursor = oracle_db.cursor()

        select_statement = """
        select 
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
        from mmsadmin.mmsstream_now mn;
        """

        cursor.execute(select_statement)
        results = cursor.fetchall()
    finally:
        oracle_db.close()

    if results is None:
        raise Exception("No values retrieved from mmsstream_now table")

    print(f'Retrieved {len(results)} records.')

    connection = psycopg2.connect(
        host=TGT_DB_HOST,
        port=TGT_DB_PORT,
        user=TGT_DB_USER,
        password=TGT_DB_PASS,
        dbname=TGT_DB_NAME)
    try:
        cursor = connection.cursor()

        print('Creating temporary table')
        cursor.execute("CREATE TEMP TABLE temp_streamline")

        from psycopg2.extras import execute_values
        execute_values(cursor, "INSERT INTO temp (id) VALUES %s", results)

        print('Updating records the now_submissions schema')
        update_statement = """
        update mms_now_submissions.applications a
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
            archsiteaffected = ts.archsiteaffected,
            fuellubstoreonsite = ts.fuellubstoreonsite,
            fuellubstored = ts.fuellubstored,
            fuellubstoremethodbarrel = ts.fuellubstoremethodbarrel,
            fuellubstoremethodbulk = ts.fuellubstoremethodbulk
        from temp_streamline ts
        where applications.mms_cid = temp_streamline.mms_cid
        """

        for record in results:
            cur.execute(update_statement)

    finally:
        connection.close()


if __name__ == '__main__':
    etl_streamline_now()
