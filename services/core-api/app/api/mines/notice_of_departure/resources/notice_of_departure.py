from flask_restplus import Resource, reqparse, inputs
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import (requires_any_of, EDIT_DO, MINESPACE_PROPONENT)
from app.api.mines.notice_of_departure.models.notice_of_departure import NoticeOfDeparture, NodStatus, NodType
from app.api.mines.response_models import NOD_MODEL, CREATE_NOD_MODEL


class NoticeOfDepartureResource(Resource, UserMixin):

    @api.doc(params={'mine_guid': 'Mine guid.', 'nod_guid': 'Nod guid.'})
    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    @api.marshal_with(NOD_MODEL, code=200)
    def get(self, mine_guid, nod_guid):

        nod = NoticeOfDeparture.find_one(nod_guid, True)

        return nod

    @api.doc(params={'mine_guid': 'Mine guid.', 'nod_guid': 'Nod guid.'})
    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    @api.expect(CREATE_NOD_MODEL)
    @api.marshal_with(NOD_MODEL, code=200)
    def patch(self, mine_guid, nod_guid):

        nod = NoticeOfDeparture.find_one(nod_guid, True)
        parser = reqparse.RequestParser()

        parser.add_argument(
            'nod_title',
            type=inputs.regex('^.{1,50}$'),
            help='Notice of Departure title (50 chars max)',
            location='json',
            store_missing=False)
        parser.add_argument(
            'permit_guid', type=str, help='Permit identifier', location='json', store_missing=False)
        parser.add_argument(
            'nod_description',
            type=str,
            help='Notice of Departure description',
            location='json',
            store_missing=False)
        data = parser.parse_args()

        nod.nod_title = data.get('nod_title')
        nod.nod_description = data.get('nod_description')
        nod.nod_type = NodType.potentially_substantial # todo: removed when this feature if being built
        nod.nod_status = NodStatus.pending_review

        nod.save()

        return nod

    @api.doc(params={'mine_guid': 'Mine guid.', 'nod_guid': 'Nod guid.'})
    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    def delete(self, mine_guid, nod_guid):
        nod = NoticeOfDeparture.find_one(nod_guid, True)
        nod.delete(nod_guid)