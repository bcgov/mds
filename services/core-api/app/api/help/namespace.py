from flask_restx import Namespace

from app.api.help.resources import HelpResource

api = Namespace('help', description='Help user guide')

api.add_resource(HelpResource, '/<string:help_key>')