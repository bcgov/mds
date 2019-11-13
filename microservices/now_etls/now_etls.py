import click
import os
from dotenv import load_dotenv, find_dotenv
import psycopg2

from NOW_import import NOW_submissions_ETL
from mms_now_import import mms_now_submissions_ETL
from create_now_identities import create_and_update_now_identities
ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

DB_HOST = os.environ.get('DB_HOST')
DB_USER = os.environ.get('DB_USER')
DB_PASS = os.environ.get('DB_PASS')
DB_PORT = os.environ.get('DB_PORT')
DB_NAME = os.environ.get('DB_NAME')


@click.command()
def etl_now_submission_data():
    connection = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME)
    try:
        click.echo('Beginning ETL')
        NOW_submissions_ETL(connection)
    finally:
        connection.close()


@click.command()
def etl_mms_now_submission_data():

    connection = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME)
    try:
        click.echo('Beginning MMS Now ETL')
        mms_now_submissions_ETL(connection)
    finally:
        connection.close()


@click.command()
def etl_create_identities():
    connection = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME)
    try:
        click.echo('Create and update identities using MMS/NROS/vFCBC')
        create_and_update_now_identities(connection)
    finally:
        connection.close()


if __name__ == '__main__':

    etl_now_submission_data()
    etl_mms_now_submission_data()
    etl_create_identities()
