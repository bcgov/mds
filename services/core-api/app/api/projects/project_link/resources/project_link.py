from werkzeug.exceptions import NotFound

from app.api.mines.mine.models.mine import Mine
from app.api.projects.project_link.models.project_link import ProjectLink
from app.api.projects.response_models import PROJECT_LINK_MODEL
from app.api.utils.access_decorators import requires_any_of, MINE_ADMIN, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from flask_restplus import Resource, inputs
from app.api.utils.custom_reqparser import CustomReqparser
from app.extensions import api


class ProjectLinkListResource(Resource, UserMixin):
    parser = CustomReqparser()

    parser.add_argument(
        'project_guid',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'related_project_guid',
        type=str,
        store_missing=False,
        required=False,
    )

    @api.doc(
        description='Create a new Project Link.',
        params={'mine_guid': 'The GUID of the mine to create the Project Link for.'})
    @api.expect(parser)
    @api.marshal_with(PROJECT_LINK_MODEL, code=201)
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT])
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()
        project_link = ProjectLink.create(data.get('project_guid'),
                                     data.get('related_project_guid'))
        project_link.save()
        return project_link, 201