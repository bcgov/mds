from flask_restplus import Namespace

from ..minespace.resources.minespace_user import MinespaceUserResource

api = Namespace('users', description='User related operations')

api.add_resource(MinespaceUserResource, '/minespace', '/<string:minespace_user_guid>')