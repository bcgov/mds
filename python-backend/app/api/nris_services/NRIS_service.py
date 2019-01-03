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

        if resp.status_code != 200:
            return None

        return resp.json().get('access_token')


def get_EMPR_data_from_NRIS(mine_no):

    current_date = datetime.now()

    try:
        token = get_NRIS_token()
    except:
        raise

    if token is None:
        return None

    url = current_app.config['NRIS_INSPECTION_URL']

    if url is None:
        raise TypeError('Could not load the NRIS URL.')
    else:
        #Inspection start date is set to 2018-01-01 as that is the begining of time for NRIS
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
            #TODO add logging for this error.
            raise

        return empr_nris_resp.json()