import decimal
import uuid
import requests
import json
import functools

from dateutil.relativedelta import relativedelta
from datetime import datetime
from flask import request, current_app
from flask_restplus import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug import exceptions
from sqlalchemy.exc import DBAPIError
from app.extensions import cache
from ..constants import NRIS_TOKEN, NRIS_COMPLIANCE_DATA, TIMEOUT_24_HOURS, TIMEOUT_12_HOURS


def _get_datetime_from_NRIS_data(date):
    return datetime.strptime(date, '%Y-%m-%d %H:%M')

def _get_inspector_from_report(report):
    prefix, inspector = report.get('assessor').split('\\')
    return inspector

def _get_NRIS_token():
    result = cache.get(NRIS_TOKEN)

    if result is None:
        params = {
            'disableDeveloperFilter': 'true',
            'grant_type': 'client_credentials',
            'scope': 'NRISWS.*'
        }
        url = current_app.config['NRIS_TOKEN_URL']
        if url is None:
            raise TypeError('Could not load the NRIS URL.')
        else:
            resp = requests.get(
                url=url,
                params=params,
                auth=(current_app.config['NRIS_USER_NAME'], current_app.config['NRIS_PASS']))
            try:
                resp.raise_for_status()
            except:
                raise

            result = resp.json().get('access_token')
            cache.set(NRIS_TOKEN, result, timeout=TIMEOUT_12_HOURS)

    return result


def _get_EMPR_data_from_NRIS(mine_no):
    current_date = datetime.now()

    try:
        token = _get_NRIS_token()
    except:
        raise

    if token is None:
        return None

    url = current_app.config['NRIS_INSPECTION_URL']

    if url is None:
        raise TypeError('Could not load the NRIS URL.')
    else:
        # Inspection start date is set to 2018-01-01 as that is the begining of time for NRIS
        params = {
            'inspectionStartDate': '2018-01-01',
            'inspectionEndDate': f'{current_date.year}-{current_date.month}-{current_date.day}',
            'mineNumber': mine_no,
        }

        headers = {'Authorization': 'Bearer ' + token}
        try:
            empr_nris_resp = requests.get(
                url=current_app.config['NRIS_INSPECTION_URL'], params=params, headers=headers)
        except requests.exceptions.Timeout:
            raise

        try:
            empr_nris_resp.raise_for_status()
        except requests.exceptions.HTTPError:
            # TODO add logging for this error.
            raise

        return empr_nris_resp.json()


def _process_NRIS_data(data, mine_no):
    data = sorted(
        data,
        key=lambda k: datetime.strptime(k.get('assessmentDate'), '%Y-%m-%d %H:%M'),
        reverse=True)

    advisories = 0
    warnings = 0
    num_open_orders = 0
    num_overdue_orders = 0
    section_35_orders = 0
    open_orders_list = []

    for report in data:
        report_date = _get_datetime_from_NRIS_data(report.get('assessmentDate'))
        inspector = _get_inspector_from_report(report)
        inspection = report.get('inspection')
        stops = inspection.get('stops')
        order_count = 1

        one_year_ago = datetime.now() - relativedelta(years=1)
        for stop in stops:

            stop_orders = stop.get('stopOrders')
            stop_advisories = stop.get('stopAdvisories')
            stop_warnings = stop.get('stopWarnings')

            for order in stop_orders:
                if order.get('orderStatus') == 'Open':

                    legislation = order.get('orderLegislations')
                    permit = order.get('orderPermits')
                    section = None

                    if legislation:
                        section = legislation[0].get('section')
                    elif permit:
                        section = permit[0].get('permitSectionNumber')

                    order_to_add = {
                        'order_no': f'{report.get("assessmentId")}-{order_count}',
                        'violation': section,
                        'report_no': report.get('assessmentId'),
                        'inspector': inspector,
                        'due_date': order.get('orderCompletionDate'),
                        'overdue': False,
                    }

                    num_open_orders += 1

                    if order.get(
                            'orderCompletionDate') is not None and _get_datetime_from_NRIS_data(
                                order.get('orderCompletionDate')) < datetime.now():
                        num_overdue_orders += 1
                        order_to_add['overdue'] = True

                    open_orders_list.append(order_to_add)
                    order_count += 1

                if order.get('orderAuthoritySection') == 'Section 35':
                    section_35_orders += 1

            if one_year_ago < report_date:
                advisories += len(stop_advisories)
                warnings += len(stop_warnings)

    latest_report = data[0] if data else None
    overview = {
        'last_inspection': latest_report.get('assessmentDate') if latest_report else None,
        'last_inspector': _get_inspector_from_report(latest_report) if latest_report else None,
        'num_open_orders': num_open_orders,
        'num_overdue_orders': num_overdue_orders,
        'advisories': advisories,
        'warnings': warnings,
        'section_35_orders': section_35_orders,
        'open_orders': open_orders_list,
    }
    cache.set(NRIS_COMPLIANCE_DATA(mine_no),
              overview, timeout=TIMEOUT_24_HOURS)
    return overview
