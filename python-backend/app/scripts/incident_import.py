import psycopg2
import uuid
import petl as etl
from petl import timeparser
from datetime import datetime, time, timedelta
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


table = src_table
print('TOTAL SOURCE ROWS = ' + str(etl.nrows(table)))
print('SOURCE HEADERS = ' + str(etl.header(table)))

#UNUSED COLUMNS
if CLEAN_UP:
    table = clean_up(table, 'rcv_nm')
    table = clean_up(table, 'recp_cd')
    table = clean_up(table, 'ins_ind')
    table = clean_up(table, 'geo_ind')
    table = clean_up(table, 'cid')
    table = clean_up(table, 'occ_typ')
    print('TRIMMED HEADERS = ' + str(etl.header(table)))

table = etl.select(table, 'occ_dt', lambda x: x > datetime(2000, 1, 1))
print('ROWS POST YR 2000 = ' + str(etl.nrows(table)))

mine_table = etl.fromcsv('mines.csv', encoding='utf-8')

##handle leading 0's
mine_table = etl.convert(mine_table, 'mine_no', lambda x: str(int(x)))
table = etl.convert(table, 'mine_no', lambda x: str(int(x)))

#MAP mine_no to mine_guid
table = etl.leftjoin(table, mine_table, key='mine_no')
table = clean_up(table, 'mine_no')
#make sure this is 0
if etl.valuecount(table, 'mine_guid', None)[0] > 0:
    print('mine_guid, mine_no pair missing from mines.csv')
    exit(1)

######
print('CONVERT AND RENAME descript1 to recommendation')
table = etl.addfield(table, 'recommendation', lambda x: x['descript1'])
table = clean_up(table, 'descript1')

######
print('CONVERTING sta_cd to status_code')
table = etl.addfield(table, 'status_code', lambda x: x['sta_cd'])
table = etl.convert(table, 'status_code', 'replace', 'O', 'F')
table = etl.convert(table, 'status_code', 'replace', 'F', 'FIN')
table = etl.convert(table, 'status_code', 'replace', 'P', 'PRE')
print(etl.valuecounter(table, 'sta_cd'))
print(etl.valuecounter(table, 'status_code'))
table = clean_up(table, 'sta_cd')

######
print('CONVERT AND RENAME rep_nm to reported_by_name')
table = etl.addfield(table, 'reported_by_name', lambda x: x['rep_nm'])
table = clean_up(table, 'rep_nm')

######
print('CONVERT AND RENAME descript to incident_description')
table = etl.addfield(table, 'incident_description', lambda x: x['descript'])
table = clean_up(table, 'descript')

######
print('COMBINING occ_dt and occ_tm into incident_timestamp')
table = etl.convert(table, 'occ_tm', timeparser('%H:%M'))
table = etl.addfield(
    table, 'incident_timestamp', lambda x: datetime.combine(x['occ_dt'], (x['occ_tm'] or time(0, 0))
                                                            ) + timedelta(hours=8))

debug(table, ['occ_dt', 'occ_tm', 'incident_timestamp'])
table = clean_up(table, 'occ_dt')
table = clean_up(table, 'occ_tm')

#####
print("CREATING mine_incident_id_year from incident_timestamp")
table = etl.addfield(table, 'mine_incident_id_year', lambda x: x['incident_timestamp'].year)
print(etl.valuecounter(table, 'mine_incident_id_year'))

######
print('COMBINING rep_dt and rep_tm into reported_timestamp')
table = etl.convert(table, 'rep_tm', timeparser('%H:%M'))
table = etl.addfield(
    table, 'reported_timestamp', lambda x: datetime.combine(x['rep_dt'], (x['rep_tm'] or time(0, 0))
                                                            ) + timedelta(hours=8))
debug(table, ['rep_dt', 'rep_tm', 'reported_timestamp'])
table = clean_up(table, 'rep_dt')
table = clean_up(table, 'rep_tm')

####### Number of fatalities
print('JOINING number_of_fatalities from mms.mssoccd checkbox')
fatalities_table = etl.fromcsv('do_fatalities.csv', encoding='utf-8')
fatalities_table = etl.convert(fatalities_table, 'min_acc_no', str)
table = etl.leftjoin(table, fatalities_table, key='min_acc_no')
table = etl.addfield(
    table, 'number_of_fatalities', lambda x: 1 if x['chk'] else 0)  #this is a boolean in src
table = etl.cutout(table, 'chk')
print('\t# OF INCIDENTS WITH FATALITIES ' +
      str(etl.valuecount(table, 'number_of_fatalities', 1)[0]))

####### Number of Injuries
print('JOINING number_of_injuries from mms.mssoccd occ_typ D02 textbox')
injuries_table = etl.fromcsv('do_injuries.csv', encoding='utf-8')
injuries_table = etl.cutout(injuries_table, 'occ_typ')
injuries_table = etl.convert(injuries_table, 'min_acc_no', str)
injuries_table = etl.convert(injuries_table, 'val', lambda x: int(x.strip()) if x.strip() else 0)
table = etl.leftjoin(table, injuries_table, key='min_acc_no')
table = etl.addfield(table, 'number_of_injuries', lambda x: x['val'] or 0)

num_val_zero_or_none = etl.valuecount(table, 'val', 0)[0] + etl.valuecount(table, 'val', None)[0]
num_num_of_injuries_zero = etl.valuecount(table, 'number_of_injuries', 0)[0]
if num_val_zero_or_none != num_num_of_injuries_zero:
    print('number_of_injuries integer conversion error' + str(num_val_zero_or_none) + '!=' +
          str(num_num_of_injuries_zero))
    exit(1)
table = clean_up(table, 'val')
####### FOLLOWUP_INSPECTION
print('CREATING followup_inspection_date from insp_dt')
table = etl.addfield(table, 'followup_inspection_date', lambda x: (x['insp_dt'] + timedelta(hours=8)
                                                                   ) if x['insp_dt'] else None)
######
print('CREATING followup_inspection from insp_dt is None')
table = etl.addfield(table, 'followup_inspection', lambda x: x['insp_dt'] is not None)
num_insp_dt_null = etl.valuecount(table, 'insp_dt', None)[0]
num_followup_insp_false = etl.valuecount(table, 'followup_inspection', False)[0]
if num_insp_dt_null != num_followup_insp_false:
    print('followup_inspection boolean conversion error' + str(num_insp_dt_null) + '!=' +
          str(num_followup_insp_false))
    exit(1)

######
print('CREATING followup_investigation_type_code = HUK')
table = etl.addfield(table, 'followup_investigation_type_code', 'HUK')
table = clean_up(table, 'insp_dt')
####
print('CONVERTING occ_ind to determination_type_code')
table = etl.addfield(table,
                     'determination_type_code', lambda x: 'DO' if x['occ_ind'] == 'Y' else 'NDO')
print(etl.valuecounter(table, 'occ_ind'))
print(etl.valuecounter(table, 'determination_type_code'))
table = clean_up(table, 'occ_ind')

#### NO SOURCE
print('CREATING emergency_services_called = null')
table = etl.addfield(table, 'emergency_services_called', None)

print('RENAMING mine_acc_no to mine_incident_no')
table = etl.rename(table, 'mine_acc_no', 'proponent_incident_no')

print('CREATING create_user = MMS_DO_IMPORT')
table = etl.addfield(table, 'create_user', 'MMS_DO_IMPORT')
table = etl.addfield(table, 'update_user', 'MMS_DO_IMPORT')

#RENAME SOURCE COLUMNS WE WANT TO PRESERVE
print("RENAME insp_cd to mms_insp_cd")
table = etl.rename(table, 'insp_cd', 'mms_insp_cd')
print("RENAME min_acc_no to mine_incident_no")
table = etl.rename(table, 'min_acc_no', 'mine_incident_no')

#force id column SQL will reset the sequence
table = etl.addrownumbers(table, field='mine_incident_id')
table = etl.sort(table, 'incident_timestamp', reverse=True)

print('UNJOIN Recommendations into separate table')
table, recommendation_table = etl.unjoin(table, 'recommendation', key='mine_incident_id')
recommendation_table = etl.select(recommendation_table,
                                  'recommendation', lambda x: x is not None and not x.isspace())
recommendation_table = etl.addfield(recommendation_table, 'create_user', 'MMS_DO_IMPORT')
recommendation_table = etl.addfield(recommendation_table, 'update_user', 'MMS_DO_IMPORT')

print("TRUNCATE public.mine_incident_recommendation")
connection.cursor().execute('TRUNCATE TABLE public.mine_incident_recommendation;')

print("TRUNCATE AND LOAD public.mine_incident")
etl.todb(table, connection, 'mine_incident')

print("TRUNCATE AND LOAD public.mine_incident_recommendation")
etl.todb(recommendation_table, connection, 'mine_incident_recommendation', dialect='postgresql')