import click

from app.extensions import db, oracle_db
from app.nris.models.nris_raw_data import NRISRawData
from app.nris.etl.nris_etl import _etl_nris_data


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

    @app.cli.command()
    def _test_xml():
        nris_data = db.session.query(NRISRawData).all()
        for item in nris_data:
            _etl_nris_data(item.nris_data)
