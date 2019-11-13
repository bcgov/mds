import psycopg2
import uuid
import petl as etl
from petl import timeparser
from datetime import datetime, time, timedelta


def create_and_update_now_identities(connection):
    with connection:
        cursor = connection.cursor()

        #MMS_NOW
        cursor.execute()

        #NOW_SUBMSSIONS from NROS/vFCBC
        cursor.execute()
