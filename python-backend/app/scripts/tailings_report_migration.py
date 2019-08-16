import uuid
import petl as etl
from petl import timeparser
from datetime import datetime, time, timedelta
from app.api.utils.apm import register_apm


@register_apm()
def append_tailings_reports_to_code_required_reports(connection, commit=False):
    src_table = etl.fromdb(
        connection,
        'SELECT exp_doc.mine_guid, exp_doc.exp_document_guid, req_doc.req_document_name, exp_doc.due_date, exp_doc.exp_document_status_code, exp_doc.received_date, exp_doc.active_ind, exp_doc_x.mine_document_guid, exp_doc.create_user, exp_doc.create_timestamp, exp_doc.update_user, exp_doc.update_timestamp from mine_expected_document exp_doc \
        inner join mine_expected_document_xref exp_doc_x on exp_doc.exp_document_guid = exp_doc_x.exp_document_guid\
        inner join mds_required_document req_doc on req_doc.req_document_guid = exp_doc.req_document_guid'
    )

    req_document_crr_defintion_map = [
        ['req_document_name', 'mine_report_definition_id'],
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
    mine_report = etl.cutout(table1, 'req_document_name')

    #to be inserted into db
    mine_report = etl.addfield(mine_report, 'submission_year', 2019)
    mine_report = etl.rename(mine_report, 'exp_document_status_code',
                             'mine_report_submission_status_code')
    mine_report = etl.addfield(mine_report, 'deleted_ind', lambda x: not x.active_ind)
    mine_report = etl.cutout(mine_report, 'active_ind')
    #to determine what FK's will be so can insert into related tables
    max_report_id = etl.fromdb(connection,
                               'select last_value from public.mine_report_mine_report_id_seq')[1][0]
    max_report_submission_id = etl.fromdb(
        connection,
        'select last_value from public.mine_report_submission_mine_report_submission_id_seq')[1][0]

    #if sequence hasn't been used yet, fix off by one
    if max_report_id == 1:
        max_report_id = 0
    if max_report_submission_id == 1:
        max_report_submission_id = 0

    #get one-to-many
    mine_report, mine_report_submission_documents = etl.unjoin(mine_report,
                                                               'mine_document_guid',
                                                               key='exp_document_guid')

    #add PK's for mappings
    mine_report_with_ids = etl.addrownumbers(mine_report,
                                             start=max_report_id + 1,
                                             step=1,
                                             field='mine_report_id')
    mine_report_with_ids = etl.addrownumbers(mine_report_with_ids,
                                             start=max_report_submission_id + 1,
                                             step=1,
                                             field='mine_report_submission_id')
    print(f'max_report_id= {max_report_id}, max_report_submission_id={max_report_submission_id}')
    #copy out fields for submission tables
    mine_report_submissions = etl.cut(mine_report_with_ids, [
        'mine_report_id', 'exp_document_guid', 'mine_report_submission_status_code', 'create_user',
        'create_timestamp', 'update_user', 'update_timestamp'
    ])
    mine_report_submissions = etl.addfield(mine_report_submissions,
                                           'submission_date', lambda x: x.create_timestamp)
    #remove fields not in mine_report
    mine_report = etl.cutout(mine_report, 'mine_report_submission_status_code')

    #replace exp_document_guid FK with mine_report_submission FK
    submission_id_lookup = etl.cut(mine_report_with_ids,
                                   ['mine_report_submission_id', 'exp_document_guid'])
    mine_report_submission_documents = etl.join(submission_id_lookup,
                                                mine_report_submission_documents,
                                                key='exp_document_guid')
    mine_report_submission_documents = etl.cutout(mine_report_submission_documents,
                                                  'exp_document_guid')

    #removed original PK
    mine_report = etl.cutout(mine_report, 'exp_document_guid')
    mine_report_submissions = etl.cutout(mine_report_submissions, 'exp_document_guid')

    print(etl.valuecounter(etl.distinct(table1, key='exp_document_guid'), 'req_document_name'))
    print(etl.valuecounter(mine_report, 'mine_report_definition_id'))
    print(table1)
    print(mine_report)
    print(mine_report_submissions)
    print(mine_report_submission_documents)

 
    etl.appenddb(mine_report, connection, 'mine_report', commit=False)
    print('INSERT mine_report staged')
    etl.appenddb(mine_report_submissions, connection, 'mine_report_submission', commit=False)
    print('INSERT mine_report_submission staged')
    etl.appenddb(mine_report_submission_documents,
                    connection,
                    'mine_report_document_xref',
                    commit=False)
    print('INSERT mine_report_document_xref staged')
    if commit:  
        connection.commit()
        print('DATA CREATION COMPLETE')
    else:
        connection.rollback()
        print('NO DATA CREATED: add --commit=true to insert report rows')


@register_apm()
def delete_tailings_data(connection, commit=False):
    cursor = connection.cursor()
    cursor.execute(
        'TRUNCATE TABLE mine_expected_document_xref, mine_expected_document CONTINUE IDENTITY RESTRICT;'
    )
    print('TRUNCATE mine_expected_document_xref and mine_expected_document staged')
    cursor.execute('UPDATE public.mds_required_document SET active_ind=false;')
    print('UPDATE mds_required_document active_ind FALSE staged')
    if commit:
        connection.commit()
        print('TRUNCATION COMPLETE')
    else:
        connection.rollback()
        print('NO DATA DELETED: add --commit=true to delete tailings reports and documents data')
