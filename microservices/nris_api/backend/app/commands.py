import click

from app.extensions import db, oracle_db
from app.nris.models.test_model import Factorial


def register_commands(app):
    @app.cli.command()
    def _test_oracle_db():
        cursor = oracle_db.cursor()

        cursor.execute('select * from CORS.CORS_CV_ASSESSMENTS')
        col = cursor.fetchone()
        cursor.close()
        app.logger.info(col)
        print(col)