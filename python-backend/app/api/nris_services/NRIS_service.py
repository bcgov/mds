import decimal
import uuid
import requests
import json
import functools

from datetime import datetime
from flask import request, current_app
from flask_restplus import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug import exceptions
from sqlalchemy.exc import DBAPIError


def get_NRIS_token():
    params = {
        'disableDeveloperFilter': 'true',
        'grant_type': 'client_credentials',
        'scope': 'NRISWS.*'
    }

    resp = requests.get(
        url=current_app.config['NRIS_TOKEN_URL'],
        params=params,
        auth=(current_app.config['NRIS_USER_NAME'],
              current_app.config['NRIS_PASS']))

    return resp.json().get('access_token')


def get_EMPR_data_from_NRIS(mine_no):

    current_date = datetime.now()
    token = get_NRIS_token()

    params = {
        'inspectionStartDate':
        '2018-01-01',
        'inspectionEndDate':
        f'{current_date.year}-{current_date.month}-{current_date.day}',
        'mineNumber':
        mine_no,
    }

    headers = {'Authorization': 'Bearer ' + token}
    empr_nris_resp = requests.get(
        url=current_app.config['NRIS_EMPR_API_URL'],
        params=params,
        headers=headers)

    return empr_nris_resp.json()