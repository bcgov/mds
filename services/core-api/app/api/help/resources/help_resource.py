from flask_restx import Resource, reqparse, inputs
from werkzeug.exceptions import NotFound
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, EDIT_HELPDESK
from app.extensions import api
from werkzeug.exceptions import NotFound, BadRequest

from app.api.utils.resources_mixins import UserMixin
from app.api.help.models.help import Help
from app.api.help.response_models import HELP_MODEL

class HelpResource(Resource, UserMixin):

    parser = reqparse.RequestParser()
    parser.add_argument(
        'help_key_params',
        help='Specificity for where to use help (ex: { "tab": "overview" })',
        type=str,
        location='json',
        required=False,
    )
    parser.add_argument(
        'content',
        type=str,
        help='Help user guide content',
        location='json',
        required=False,
    )
    parser.add_argument(
        'is_draft',
        type=bool,
        help='Is the guide in a draft state',
        location='json',
        required=False,
    )

    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(HELP_MODEL, code=200, envelope='records')
    def get(self, help_key):
        help_guides = Help.find_by_help_key(help_key)
        return help_guides
    
    @requires_any_of([EDIT_HELPDESK])
    @api.marshal_with(HELP_MODEL, code=201)
    def post(self, help_key):
        data = parser.parse_args()
        content = data.get('content')
        help_key_params = data.get('help_key_params')
        is_draft = data.get('is_draft')

        help_guide = Help.create(help_key, content, help_key_params, is_draft)
        help_guide.save()
        return help_guide