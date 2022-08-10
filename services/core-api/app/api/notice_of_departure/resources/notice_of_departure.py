from flask_restplus import Resource, reqparse, inputs
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.activity.utils import trigger_notifcation
from app.api.utils.access_decorators import (requires_any_of, EDIT_DO, MINESPACE_PROPONENT)
from app.api.notice_of_departure.models.notice_of_departure import NoticeOfDeparture, NodStatus, NodType
from app.api.notice_of_departure.dto import NOD_MODEL, UPDATE_NOD_MODEL
from app.api.notice_of_departure.utils.validators import contact_validator


class NoticeOfDepartureResource(Resource, UserMixin):

    @api.doc(params={'nod_guid': 'Nod guid.'})
    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    @api.marshal_with(NOD_MODEL, code=200)
    def get(self, nod_guid):
        nod = NoticeOfDeparture.find_one(
            nod_guid, include_documents=True, include_primary_contact_only=True)
        return nod

    @api.doc(params={'nod_guid': 'Nod guid.'})
    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    @api.expect(UPDATE_NOD_MODEL)
    @api.marshal_with(NOD_MODEL, code=200)
    def patch(self, nod_guid):

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
        parser.add_argument(
            'nod_type',
            type=NodType,
            help='Notice of Departure type',
            location='json',
            choices=list(NodType),
            store_missing=False)
        parser.add_argument(
            'nod_status',
            type=NodStatus,
            help='Notice of Departure status',
            location='json',
            choices=list(NodStatus),
            store_missing=False)
        parser.add_argument(
            'nod_contacts',
            help='Notice of Departure contacts',
            location='json',
            required=True,
            type=contact_validator,
            store_missing=False)
        data = parser.parse_args()

        update_nod = NoticeOfDeparture.find_one(nod_guid)

        old_status = update_nod.nod_status

        update_nod.update(
            nod_title=data.get('nod_title'),
            nod_description=data.get('nod_description'),
            nod_status=data.get('nod_status'),
            nod_type=data.get('nod_type'),
            nod_contacts=data.get('nod_contacts'))

        if (update_nod.nod_status is not old_status):
            extra_notification_data = {
                'permit': {
                    'permit_no': update_nod.permit.permit_no
                }
            }

            message = "Notice Of Departure %s status changed from %s to %s" % (update_nod.nod_no, old_status.display_name(), update_nod.nod_status.display_name())
            trigger_notifcation(message, update_nod.mine, 'NoticeOfDeparture', update_nod.nod_guid, extra_notification_data)

        return update_nod

    @api.doc(params={'nod_guid': 'Nod guid.'})
    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    def delete(self, nod_guid):
        nod = NoticeOfDeparture.find_one(nod_guid, True)
        nod.delete(nod_guid)
