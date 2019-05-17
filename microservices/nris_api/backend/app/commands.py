import click

from app.extensions import db, oracle_db
from app.nris.etl.models.nris_raw_data import NRISRawData


def register_commands(app):
    @app.cli.command()
    def _test_oracle_db():
        cursor = oracle_db.cursor()

        cursor.execute(
            "select xml_document from CORS.CORS_CV_ASSESSMENTS_XVW where business_area = 'EMPR'")
        results = cursor.fetchall()

        for result in results:
            data = NRISRawData.create(result[0].read())
            db.session.add(data)
            db.session.commit()

        cursor.close()
