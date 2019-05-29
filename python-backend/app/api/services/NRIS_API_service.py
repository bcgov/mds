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
from app.api.utils.apm import register_apm

def _get_datetime_from_NRIS_data(date):
    return datetime.strptime(date, '%Y-%m-%d %H:%M')


def _get_inspector_from_report(report):
    prefix, inspector = report.get('assessor').split('\\')
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
    return current_year if current_date > fiscal_year_end else current_year - 1

@register_apm
def _get_NRIS_data_by_mine(token, mine_no):
    current_date = datetime.utcnow()

    url = 'http://nris_backend:5500/inspections'  #current_app.config['NRIS_API_INSPECTION_URL']

    if url is None:
        raise TypeError('Could not load the NRIS URL.')
    else:
        # Inspection start date is set to 2018-01-01 as that is the begining of time for NRIS
        #headers = {'Authorization': 'Bearer ' + token}
        try:
            empr_nris_resp = requests.get(url=f'{url}?mine_no={mine_no}')  #, headers=headers)
        except requests.exceptions.Timeout:
            raise

        try:
            empr_nris_resp.raise_for_status()
        except requests.exceptions.HTTPError:
            # TODO add logging for this error.
            raise

        return empr_nris_resp.json()