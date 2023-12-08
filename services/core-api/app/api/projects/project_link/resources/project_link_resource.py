from werkzeug.exceptions import NotFound

from app.api.mines.mine.models.mine import Mine
from app.api.projects.project_link.models.project_link import ProjectLink
from app.api.projects.response_models import PROJECT_LINK_MODEL
from app.api.utils.access_decorators import requires_any_of, MINE_ADMIN, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from flask_restplus import Resource, inputs
from app.api.utils.custom_reqparser import CustomReqparser
from app.extensions import api
from flask import current_app

class ProjectLinkListResource(Resource, UserMixin):
    parser = CustomReqparser()

    parser.add_argument(
        'mine_guid',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'related_project_guids',
        type=list,
        location='json',
        store_missing=False,
        required=True,
        help='A list of GUIDs of the related projects to add'
    )
    @api.doc(
        description='Create a new Project Link.',
        )
    @api.expect(parser)
    @api.marshal_with(PROJECT_LINK_MODEL, code=201)
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT])
    def post(self, project_guid):
        data = self.parser.parse_args()
        mine_guid = data.get('mine_guid')
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')
        # TODO: Each related project should be from the same mine
        
        project_links = ProjectLink.create_many(project_guid,
                                     data.get('related_project_guids'))
        current_app.logger.info(project_links)
        # project_link.save()
        return project_links, 201

    @api.doc(
        description='Delete a Project Link.',
        params={
            'project_link_guid': 'The GUID of the Project Link to delete.'
        })
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT])
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, project_link_guid):
        project_link = ProjectLink.find_by_project_link_guid(
            project_link_guid)
        if project_link is None:
            raise NotFound('Project Link Not found')

        project_link.delete()
        return None, 204
