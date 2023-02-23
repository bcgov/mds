from flask import current_app
from flask_restplus import reqparse
from werkzeug.exceptions import BadRequest

DEFAULT_MISSING_REQUIRED = 'Missing required argument.'

class CustomReqparser():

    def __init__(self):
        parser_instance = reqparse.RequestParser(trim=True)
        self.parser = parser_instance
        self.add_argument = parser_instance.add_argument

    def parse_args(self):
        try:
            data = self.parser.parse_args()
        except BadRequest as e:
            current_app.logger.error(e.data)
            raise BadRequest(f'{DEFAULT_MISSING_REQUIRED} {e.data}')
        return data
