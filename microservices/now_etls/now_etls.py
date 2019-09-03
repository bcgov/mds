import click
import os
from dotenv import load_dotenv, find_dotenv
import psycopg2

from NOW_import import NOW_submissions_ETL

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

DB_HOST = os.environ.get('DB_HOST')
DB_USER = os.environ.get('DB_USER')
DB_PASS = os.environ.get('DB_PASS')
DB_PORT = os.environ.get('DB_PORT')
DB_NAME = os.environ.get('DB_NAME')


@click.command()
@click.option('--commit', default=False, help='Whether to commit NoW ETL')
def etl_now_submission_data(commit):

    connection = psycopg2.connect(
        host=DB_HOST, port=DB_PORT,
        user=DB_USER, password=DB_PASS, dbname=DB_NAME)

    click.echo('Beginning ETL')
    NOW_submissions_ETL(connection)


if __name__ == '__main__':
    etl_now_submission_data()
