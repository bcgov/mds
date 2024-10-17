from flask_restx import Resource, reqparse
from flask import request
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, EDIT_HELPDESK, is_minespace_user
from app.extensions import api
from werkzeug.exceptions import BadRequest
from enum import Enum

from app.api.utils.resources_mixins import UserMixin
from app.api.help.models.help import Help
from app.api.help.response_models import HELP_MODEL

class SystemFlag(Enum):
    core = "CORE"
    ms = "MineSpace"

    def __str__(self):
        return self.value
    
class HelpListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'system',
        type=str,
        help='The system (CORE or MineSpace) where the guide will be displayed',
        location='json',
        required=False,
    )
    

    @api.doc(
        description="List all help guides",
    )
    @api.marshal_with(HELP_MODEL, code=200, as_list=True, envelope="records")
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        data = self.parser.parse_args()
        system = data.get("system", None) if not is_minespace_user() else SystemFlag.ms

        help_guides = Help.get_all(system)
        return help_guides    

class HelpResource(Resource, UserMixin):

    parser = reqparse.RequestParser()
    parser.add_argument(
        'system',
        type=str,
        help='The system (CORE or MineSpace) where the guide will be displayed',
        location='json',
        required=False,
    )
    parser.add_argument(
        'page_tab',
        type=str,
        help='The specific tab on the page that the help guide is for',
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
    parser.add_argument(
        'help_guid',
        type=str,
        help='The identifier of the help guide to modify',
        location='json',
        required=False,
    )    

    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(HELP_MODEL, code=200, envelope='records', as_list=True)
    def get(self, help_key):
        system = request.args['system']
        if is_minespace_user() and system != SystemFlag.ms:
            raise BadRequest("Only MineSpace help guides may be requested.")
        help_guides = Help.find_by_help_key(help_key, system)
        return help_guides
    
    @requires_any_of([EDIT_HELPDESK])
    @api.expect(parser)
    @api.marshal_with(HELP_MODEL, code=201)
    def post(self, help_key):
        data = self.parser.parse_args()
        content = data.get('content')
        system = data.get('system')
        page_tab = data.get('page_tab')
        is_draft = data.get('is_draft')

        help_guide = Help.create(help_key, content, system, page_tab, is_draft)
        help_guide.save()
        return help_guide, 201
    
    @requires_any_of([EDIT_HELPDESK])
    @api.expect(parser)
    @api.marshal_with(HELP_MODEL, code=200)
    def put(self, help_key):
        data = self.parser.parse_args()
        help_guid = data.get('help_guid', None)

        if help_guid is None:
            raise BadRequest("help_guid is required.")

        help_guide = Help.find_by_help_guid(help_guid)
        if help_guide is None or help_guide.help_key != help_key:
            raise BadRequest("Help Guide not found.")
        
        for key, value in data.items():
            setattr(help_guide, key, value)

        help_guide.save()
        return help_guide
    
    @api.doc(
        description="Delete a help guide"
    )
    @requires_any_of([EDIT_HELPDESK])
    @api.response(204, "Successfully deleted help guide.")
    def delete(self, help_key):
        help_guid = request.args['help_guid']

        if help_guid is None:
            raise BadRequest("help_guid is required.")
        
        help_to_delete = Help.find_by_help_guid(help_guid)
        if help_to_delete is None or help_to_delete.help_key != help_key:
            raise BadRequest("Help Guide not found.")
        help_to_delete.delete()