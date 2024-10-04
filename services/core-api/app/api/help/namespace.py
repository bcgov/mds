from flask_restx import Namespace

from app.api.help.resources.help_resource import HelpResource, HelpListResource

api = Namespace('help', description='Help user guide')

api.add_resource(HelpListResource, '')
api.add_resource(HelpResource, '/<string:help_key>')