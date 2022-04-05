import uuid
from flask_restplus import Resource, marshal_with, inputs
from werkzeug.exceptions import BadRequest, NotFound
from flask_restplus import reqparse
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL, MINESPACE_PROPONENT,
                                             EDIT_DO)
from app.api.mines.permits.notice_of_departure.models.notice_of_departure import NoticeOfDeparture
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.mine.models.mine import Mine
from app.api.mines.response_models import PERMIT_NOD_MODEL, CREATE_NOD_MODEL


class PermitNoticeOfDepartureListResource(Resource, UserMixin):

    @api.doc(params={'permit_guid': 'Permit guid.', 'mine_guid': 'Mine guid.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PERMIT_NOD_MODEL, code=200, envelope='records')
    def get(self, mine_guid, permit_guid):
        nods = NoticeOfDeparture.find_all_by_permit_guid(permit_guid)
        return nods

    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    @api.expect(CREATE_NOD_MODEL)
    @api.marshal_with(PERMIT_NOD_MODEL, code=201)
    def post(self, mine_guid, permit_guid):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'title',
            type=inputs.regex('^.{1,50}$'),
            help='Notice of Departure title (50 chars max)',
            location='json',
            required=True,
            store_missing=False)
        data = parser.parse_args()

        permit = Permit.find_by_permit_guid(permit_guid, mine_guid)
        if not permit:
            raise NotFound('Either permit does not exist or does not belong to the mine')
        new_nod = NoticeOfDeparture.create(permit._context_mine, permit, nod_title=data.get('title'))
        new_nod.save()

        return new_nod
