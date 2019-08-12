import psycopg2
import uuid
import petl as etl
from petl import timeparser
from datetime import datetime, time, timedelta

#def do_tailings_conversion():
connection = psycopg2.connect(host='postgres', port=5432, user='mds', password='test', dbname='mds')

src_table = etl.fromdb(
    connection,
    'SELECT exp_doc.mine_guid, req_doc.req_document_name, exp_doc.due_date, exp_doc_x.mine_document_guid from mine_expected_document exp_doc \
    inner join mine_expected_document_xref exp_doc_x on exp_doc.exp_document_guid = exp_doc_x.exp_document_guid\
    inner join mds_required_document req_doc on req_doc.req_document_guid = exp_doc.req_document_guid'
)

req_document_crr_defintion_map = [
    ['req_document_name', 'mine_report_defintion_id'],
    ['Summary of TSF and Dam Safety Recommendations', 28],
    ['ITRB Activities Report', 27],
    ['Register of Tailings Storage Facilities and Dams', 47],
    ['Dam Safety Inspection (DSI) Report', 26],
    ['Dam Safety Review (DSR) Report', 31],
    ['“As-built” Reports', 32],
    ['Annual Reclamation', 25],
    ['MERP Record of Testing', 3],
    #['Annual Manager\'s Report', __________________ ], no mapping or data, ignore.
    ['OMS Manual', 33],
    ['Annual reconciliation of water balance and water management plans', 44],
    ['TSF risk assessment', 46],
    ['Mine Emergency Preparedness and Response Plan (MERP)', 24],
    ['Performance of high risk dumps', 29]
]

table1 = etl.join(src_table, req_document_crr_defintion_map, 'req_document_name')
table1 = etl.cutout(table1, 'req_document_name')
print(table1)
