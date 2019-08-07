from flask_restplus import Namespace

from app.api.now_submissions.now_submission.resources.application_resource import NOWApplicationResource

api = Namespace('now', description='Notice of Work operations')

api.add_resource(NOWApplicationResource, '/<string:now_application_guid>')
