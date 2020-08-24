import psycopg2, os

from app.extensions import db
from dotenv import load_dotenv, find_dotenv
from flask import current_app
from app.cli_jobs.etl.address_etl import address_etl

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

DB_HOST = os.environ.get('DB_HOST')
DB_USER = os.environ.get('DB_USER')
DB_PASS = os.environ.get('DB_PASS')
DB_PORT = os.environ.get('DB_PORT')
DB_NAME = os.environ.get('DB_NAME')


def run_ETL():

    connection = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME)
    try:
        print('Beginning Core ETL')

        db.session.execute('select transfer_mine_information();')
        db.session.commit()
        db.session.execute('select transfer_mine_manager_information();')
        db.session.commit()

        db.session.execute('select transfer_permit_permitee_but_better();')
        db.session.commit()

        db.session.execute('select transfer_mine_status_information();')
        db.session.commit()

        # db.session.execute('select mms_etl_bond_data();') TODO make automatic after business validation
        # db.session.commit()
    finally:
        connection.close()


def run_address_etl():
    address_etl()