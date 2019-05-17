from xmljson import parker
from xml.etree.ElementTree import fromstring
from flask import current_app


def convert_xml_to_json(input):
    data = parker.data(fromstring(input), preserve_root=True)
    current_app.logger.info(data)
    return data