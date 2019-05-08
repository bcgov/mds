import click
import cx_Oracle

from app.extensions import db  #, oracle_db
from app.nris.models.test_model import Factorial

from .config import Config


def register_commands(app):
    @app.cli.command()
    def _test_oracle_db():

        dsn_tns = cx_Oracle.makedsn(
            Config.NRIS_DB_HOSTNAME, Config.NRIS_DB_PORT, service_name=Config.NRIS_DB_SERVICENAME)
        app.logger.info(f'dsn_tns created >> {dsn_tns}')
        app.logger.info(f'dsn_tns created >> {dsn_tns} ::: {dsn_tns.__dict__}')
        oracle_db = cx_Oracle.connect(
            user=Config.NRIS_DB_USER, password=Config.NRIS_DB_PASSWORD, dsn=dsn_tns)

        cursor = oracle_db.cursor()

        cursor.execute('select * from CORS.CORS_CV_ASSESSMENTS')
        col = cursor.fetchone()
        cursor.close()
        app.logger.info(col)