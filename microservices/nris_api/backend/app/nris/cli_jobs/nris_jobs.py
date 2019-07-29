from app.nris.utils.apm import register_apm
from app.nris.etl.nris_etl import import_nris_xml, clean_nris_xml_import, etl_nris_data, clean_nris_etl_data
from flask import current_app
import cx_Oracle


@register_apm("NRIS ETL Job")
def run_nris_etl():

    current_app.logger.info('Starting ETL process')

    # Initiate Oracle ETL
    try:
        clean_nris_xml_import()
        import_nris_xml()
        current_app.logger.info('XML Import completed')
        # TODO: Insert update into status table

        clean_nris_etl_data()
        etl_nris_data()
        current_app.logger.info('NRIS ETL Completed!')

    except cx_Oracle.DatabaseError as e:
        current_app.logger.error("Error establishing connection to NRIS database: " + str(e))
    except Exception as e:
        current_app.logger.error("Unexpected error with NRIS XML import: " + str(e))
