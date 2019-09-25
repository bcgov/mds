from flask_restplus import Namespace

from ..minespace.resources.minespace_user import MinespaceUserResource, MinespaceUserListResource
from ..minespace.resources.minespace_user_mine import MinespaceUserMineResource, MinespaceUserMineListResource

from ..core.resources.core_user import CoreUserListResource, CoreUserResource

api = Namespace('users', description='User related operations')

api.add_resource(MinespaceUserListResource, '/minespace')
api.add_resource(MinespaceUserResource, '/minespace/<user_id>')
api.add_resource(MinespaceUserMineListResource, '/minespace/<user_id>/mines')
api.add_resource(MinespaceUserMineResource, '/minespace/<user_id>/mines/<string:mine_guid>')
api.add_resource(CoreUserListResource, '/core')
api.add_resource(CoreUserResource, '/core/<core_user_guid>')