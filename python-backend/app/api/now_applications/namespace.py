from flask_restplus import Namespace

from .resources.test_resource import NOWApplicationResource

api = Namespace('now_applications', description='Party related operations')

api.add_resource(NOWApplicationResource, '/')