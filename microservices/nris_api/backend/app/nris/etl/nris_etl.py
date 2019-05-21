from xmltodict import parse
from xml.etree.ElementTree import fromstring
from flask import current_app
from json import dumps
from xml.etree import ElementTree as ET


def _etl_nris_data(input):
    data = ET.fromstring(input)
    # current_app.logger.info(data)
    return dumps(data)
