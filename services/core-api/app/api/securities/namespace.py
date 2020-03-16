from flask_restplus import Namespace

api = Namespace('bonds', description='Core Bond Operations')

api.add_resource(NOWApplicationListResource, '')
