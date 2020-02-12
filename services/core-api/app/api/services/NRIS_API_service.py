import requests, json

from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta
from flask import request, current_app
from werkzeug import exceptions
from app.api.constants import NRIS_TOKEN, NRIS_COMPLIANCE_DATA
from app.api.utils.apm import register_apm


def _get_datetime_from_NRIS_data(date):
    return datetime.strptime(date, '%Y-%m-%dT%H:%M:%S')


def _get_inspector_from_idir(idir):
    prefix, inspector = idir.split('\\')
    return inspector


def _get_fiscal_year():
    current_date = datetime.utcnow()
    current_year = datetime.utcnow().year
    march = 3
    day = 31
    hour = 00
    minute = 00
    second = 00

    fiscal_year_end = datetime(current_year, march, day, hour, minute, second)
    #current_app.logger.debug(f'{fiscal_year_end} vs {current_date}')
    return current_year if current_date > fiscal_year_end else current_year - 1


#def get_nris_download_token():


@register_apm()
def _get_NRIS_data_by_mine(auth_token, mine_no):
    current_date = datetime.utcnow()

    url = current_app.config['NRIS_API_URL'] + '/inspections'

    if url is None:
        raise TypeError('Could not load the NRIS URL.')
    else:
        headers = {'Authorization': auth_token}
        try:
            empr_nris_resp = requests.get(url=f'{url}?mine_no={mine_no}', headers=headers)
            empr_nris_resp.raise_for_status()
        except requests.exceptions.Timeout:
            raise
        except requests.exceptions.HTTPError:
            # TODO add logging for this error.
            raise

        return empr_nris_resp.json()


def _process_NRIS_data(raw_data):
    result = {
        'last_inspection': None,
        'last_inspector': None,
        'num_open_orders': 0,
        'num_overdue_orders': 0,
                                                                          #'section_35_orders': 0, no aggregate, FE filters will show where violation = 35
        'all_time': {
            'num_inspections': 0,
            'num_advisories': 0,
            'num_warnings': 0,
            'num_requests': 0,
        },
        'last_12_months': {
            'num_inspections': 0,
            'num_advisories': 0,
            'num_warnings': 0,
            'num_requests': 0,
        },
        'current_fiscal': {
            'num_inspections': 0,
            'num_advisories': 0,
            'num_warnings': 0,
            'num_requests': 0,
        },
        'year_to_date': {
            'num_inspections': 0,
        },
        'orders': [],
    }
    sorted_records = sorted(
        raw_data.get('records') or [],
        key=lambda k: _get_datetime_from_NRIS_data(k['inspection_date']),
        reverse=True)

    for inspection in sorted_records:
        inspection_date = _get_datetime_from_NRIS_data(inspection['inspection_date'])
        current_fiscal_bool = inspection_date > datetime(_get_fiscal_year(), 4, 1)
        last_12_months_bool = inspection_date > datetime.utcnow() - relativedelta(years=1)
        year_to_date_bool = inspection_date > datetime(datetime.today().year, 1, 1)

        result['all_time']['num_inspections'] += 1
        if last_12_months_bool:
            result['last_12_months']['num_inspections'] += 1
            if current_fiscal_bool:              #last Apr 1
                result['current_fiscal']['num_inspections'] += 1
            if year_to_date_bool:
                result['year_to_date']['num_inspections'] += 1

        inspection_type = inspection['inspection_type_code']
        inspector = _get_inspector_from_idir(inspection['inspector_idir'])

        if not result['last_inspection']:
            #only runs first loop
            result['last_inspection'] = inspection_date
            result['last_inspector'] = inspector

        order_count = 1
        for location in inspection['inspected_locations']:
            for stop in location['stop_details']:
                legislation = stop['noncompliance_legislations']
                violation = None
                if legislation:
                    violation = legislation[0].get('section')
                elif stop['noncompliance_permits']:
                    violation = stop['noncompliance_permits'][0].get('permitSectionNumber')

                documents = []
                for document in inspection['documents']:
                    document = {
                        'external_id': document['external_id'],
                        'document_date': document['document_date'],
                        'document_type': document['document_type'],
                        'file_name': document['file_name'],
                        'comment': document['comment']
                    }
                    documents.append(document)

                order = {
                    'order_no': str(inspection['external_id']) + '-' + str(order_count),
                    'violation': violation,
                    'report_no': inspection['external_id'],
                    'inspector': inspector,
                    'inspection_type': inspection_type,
                    'order_status': stop['stop_status'],
                    'due_date': stop['completion_date'],
                    'overdue': False,
                    'documents': documents
                }

                #Open
                if order['order_status'] in ['Open']:
                    result['num_open_orders'] += 1

                #Overdue
                if stop['completion_date'] is not None and \
                _get_datetime_from_NRIS_data(stop['completion_date']) < (datetime.utcnow() - relativedelta(days=1)) and \
                order['order_status'] == 'Open':
                    result['num_overdue_orders'] += 1
                    order['overdue'] = True
                    order['order_status'] = "Overdue"

                result['orders'].append(order)
                order_count += 1

            result['all_time']['num_advisories'] += len(location['advisory_details'])
            result['all_time']['num_warnings'] += len(location['warning_details'])
            result['all_time']['num_requests'] += len(location['request_details'])
            if last_12_months_bool:
                result['last_12_months']['num_advisories'] += len(location['advisory_details'])
                result['last_12_months']['num_warnings'] += len(location['warning_details'])
                result['last_12_months']['num_requests'] += len(location['request_details'])
                if current_fiscal_bool:
                    result['current_fiscal']['num_advisories'] += len(location['advisory_details'])
                    result['current_fiscal']['num_warnings'] += len(location['warning_details'])
                    result['current_fiscal']['num_requests'] += len(location['request_details'])

    return result