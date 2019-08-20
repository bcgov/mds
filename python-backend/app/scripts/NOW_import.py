import psycopg2
import uuid
import petl as etl
from petl import timeparser
from datetime import datetime, time, timedelta

connection = psycopg2.connect(
    host='localhost', port=5432, user='mds', password='test', dbname='mds')

cursor = connection.cursor()

table_mapping = {
    'application': 'application',
    'application_nda': 'application_nda',
    'application_start_stop': 'application_start_stop',
    'client': 'client',
    'contact': 'contact',
    'document': 'document',
    'document_nda': 'document_nda',
    'document_start_stop': 'document_start_stop',
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

for key, value in table_mapping:
    cursor.execute(f'TRUNCATE TABLE {key} CONTINUE IDENTITY;')
    current_nros_table = etl.fromdb(connection, f'SELECT * from mms_now_nros.{value}')
    etl.appenddb(current_nros_table, connection, f'now_submissions.{key}', commit=False)
