from flask_restx import reqparse
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
        except BadRequest:
            raise BadRequest(DEFAULT_MISSING_REQUIRED)
        return data
