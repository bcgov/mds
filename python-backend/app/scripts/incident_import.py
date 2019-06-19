import psycopg2
import petl as etl
from petl import timeparser
from datetime import datetime, time
connection = psycopg2.connect(host='localhost',
                              port=5432,
                              user='mds',
                              password='test',
                              dbname='mds')
src_table = etl.fromdb(connection, 'SELECT * from mms_mine_incident')

DEBUG = 1
CLEAN_UP = 1
#print(etl.head(src_table, 1))


def debug(table, columns):
    if DEBUG:
        print(etl.cut(table, columns))


def clean_up(table, column):
    if CLEAN_UP:
        return etl.cutout(table, column)


# mine_table = etl.fromcsv('mines.csv')
# print(mine_table)

table = src_table
print('TOTAL SOURCE ROWS = ' + str(etl.nrows(table)))
print('SOURCE HEADERS = ' + str(etl.header(table)))

table = etl.cutout(table, 'rcv_nm')
table = etl.cutout(table, 'insp_cd')
table = etl.cutout(table, 'ins_ind')
table = etl.cutout(table, 'geo_ind')

print('TRIMMED HEADERS = ' + str(etl.header(table)))
table = etl.select(table, 'occ_dt', lambda x: x > datetime(2000, 1, 1))
print('ROWS POST YR 2000 = ' + str(etl.nrows(table)))

######
print('CONVERT AND RENAME rep_nm to reported_by_name')
table = etl.addfield(table, 'reported_by_name', lambda x: x['rep_nm'])
table = clean_up(table, 'rep_nm')

######
print('CONVERT AND RENAME descript to incident_description')
table = etl.addfield(table, 'incident_description', lambda x: x['descript'])
table = clean_up(table, 'descript')
######
print('CONVERT AND RENAME descript1 to incident_description')
table = etl.addfield(table, 'mine_incident_recommendation', lambda x: x['descript1'])
table = clean_up(table, 'descript1')

######
print('CONVERTING sta_cd to status_code')
table = etl.addfield(table, 'status_code', lambda x: x['sta_cd'])
table = etl.convert(table, 'status_code', 'replace', 'O', 'F')
table = etl.convert(table, 'status_code', 'replace', 'F', 'FIN')
table = etl.convert(table, 'status_code', 'replace', 'P', 'PRE')

print(etl.valuecounter(table, 'sta_cd'))
print(etl.valuecounter(table, 'status_code'))
#debug(table, ['sta_cd', 'status_code'])

table = clean_up(table, 'sta_cd')

######
print('COMBINING occ_dt and occ_tm into incident_timestamp')
table = etl.convert(table, 'occ_tm', timeparser('%H:%M'))
table = etl.addfield(
    table, 'incident_timestamp', lambda x: datetime.combine(x['occ_dt'], x['occ_tm'] or time(0, 0)))

debug(table, ['occ_dt', 'occ_tm', 'incident_timestamp'])
table = clean_up(table, 'occ_dt')
table = clean_up(table, 'occ_tm')

######
print('COMBINING rep_dt and rep_tm into reported_timestamp')
table = etl.convert(table, 'rep_tm', timeparser('%H:%M'))
table = etl.addfield(
    table, 'reported_timestamp', lambda x: datetime.combine(x['rep_dt'], x['rep_tm'] or time(0, 0)))

debug(table, ['rep_dt', 'rep_tm', 'reported_timestamp'])
table = clean_up(table, 'rep_dt')
table = clean_up(table, 'rep_tm')

#######
print('CREATING followup_inspection_date from insp_dt')
table = etl.addfield(table, 'followup_inspection_date', lambda x: x['insp_dt'])

####
print('CREATING followup_inspection from insp_dt is None')
table = etl.addfield(table, 'followup_inspection', lambda x: x['insp_dt'] is not None)
print(etl.valuecount(table, 'insp_dt', None))
print(etl.valuecounter(table, 'followup_inspection'))
table = clean_up(table, 'insp_dt')

####
print('CONVERTING occ_ind to determination_type_code')
table = etl.addfield(table,
                     'determination_type_code', lambda x: 'DO' if x['occ_ind'] == 'Y' else 'NDO')
debug(table, ['occ_ind', 'determination_type_code'])
table = clean_up(table, 'occ_ind')

#### NO SOURCE
print('CREATING emergency_services_called = null')
table = etl.addfield(table, 'emergency_services_called', False)

print('CREATING AUDIT COLUMNS WITH VALUES')
table = etl.addfield(table, 'create_user', 'MMS_DO_IMPORT')

#print(etl.valuecounter(table, 'occ_typ'))

#RENAME SOURCE COLUMNS WE WANT TO KEEP
table = etl.rename(table, 'recp_cd', 'mms_recp_cd')
table = etl.rename(table, 'cid', 'mms_cid')
table = etl.rename(table, 'min_acc_no', 'mms_min_acc_no')
table = etl.rename(table, 'mine_acc_no', 'mms_mine_acc_no')
#### COLUMNS WITH NO INITIAL VALUE
# reported_by_phone_no
# reported_by_phone_ext
# reported_by_email

print(etl.header(table))