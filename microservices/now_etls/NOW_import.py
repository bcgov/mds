import psycopg2
import uuid
import petl as etl
from petl import timeparser
from datetime import datetime, time, timedelta

SHARED_TABLES = {
    'application': 'application',
    'application_nda': 'application_nda',
    'client': 'client',
    'contact': 'contact',
    'document': 'document',
    'document_nda': 'document_nda',
    'equipment': 'equipment',
    'existing_placer_activity_xref': 'existingplaceractivityxref',
    'existing_settling_pond_xref': 'existingsettlingpondxref',
    'exp_access_activity': 'expaccessactivity',
    'exp_surface_drill_activity': 'expsurfacedrillactivity',
    'mech_trenching_activity': 'mechtrenchingactivity',
    'mech_trenching_equip_xref': 'mechtrenchingequipxref',
    'placer_activity': 'placeractivity',
    'placer_equip_xref': 'placerequipxref',
    'proposed_placer_activity_xref': 'proposedplaceractivityxref',
    'proposed_settling_pond_xref': 'proposedsettlingpondxref',
    'sand_grv_qry_activity': 'sandgrvqryactivity',
    'sand_grv_qry_equip_xref': 'sandgrvqryequipxref',
    'settling_pond': 'settlingpond',
    'status_update': 'statusupdate',
    'surface_bulk_sample_activity': 'surfacebulksampleactivity',
    'surface_bulk_sample_equip_xref': 'surfacebulksampleequipxref',
    'under_exp_new_activity': 'underexpnewactivity',
    'under_exp_rehab_activity': 'underexprehabactivity',
    'under_exp_surface_activity': 'underexpsurfaceactivity',
    'water_source_activity': 'watersourceactivity',
}

NROS_ONLY_TABLES = {
    'application_start_stop': 'application_start_stop',
    'document_start_stop': 'document_start_stop',
}


def truncate_table(connection, tables):
    cursor = connection.cursor()
    for key, value in tables.items():
        cursor.execute(
            f'TRUNCATE TABLE now_submissions.{key} CONTINUE IDENTITY CASCADE;')


# Import all the data from the specified schema and tables.
def ETL_MMS_NOW_schema(connection, tables, schema, system_name):
    for key, value in tables.items():
        try:
            current_table = etl.fromdb(
                connection, f'SELECT * from {schema}.{value}')
            if value == 'application':
                originated_table = etl.addfield(
                    current_table, 'originating_system', system_name)
            etl.appenddb(originated_table, connection, key,
                         schema='now_submissions', commit=False)
        except Exception as err:
            print(f'ETL Parsing error: {err}')
            raise


def NOW_submissions_ETL(connection):
    with connection:
        # Removing the data imported from the previous run.
        truncate_table(connection, {**SHARED_TABLES, **NROS_ONLY_TABLES})

        # Importing the vFCBC NoW submission data.
        ETL_MMS_NOW_schema(connection, SHARED_TABLES, 'mms_now_vfcbc', 'VFCBC')

        # Importing the NROS NoW submission data.
        ETL_MMS_NOW_schema(
            connection, {**SHARED_TABLES, **NROS_ONLY_TABLES}, 'mms_now_nros', 'NROS')
