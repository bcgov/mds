from flask_restplus import Resource, marshal_with, inputs
from werkzeug.exceptions import BadRequest, NotFound
from flask_restplus import reqparse
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit
from app.api.mines.permits.nod.models.nod import Nod
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.mine.models.mine import Mine
from app.api.mines.response_models import NOD_MODEL


class NodResource(Resource, UserMixin):

    @api.doc(
        params={
            'permit_guid': 'Permit guid.',
            'mine_guid': 'Mine guid.',
            'nod_guid': 'Mine guid.'
        },
        defaults={'nod_guid': None})
    @requires_role_view_all
    @api.marshal_with(NOD_MODEL, code=200)
    def get(self, nod_guid):
        nod = Nod.find(nod_guid)
        return nod
