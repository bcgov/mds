from email.policy import default
import uuid
from flask_restplus import Resource, reqparse, inputs
from werkzeug.exceptions import NotFound
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL, MINESPACE_PROPONENT,
                                             EDIT_DO)
from app.api.notice_of_departure.models.notice_of_departure import NoticeOfDeparture, NodType, NodStatus, OrderBy, Order
from app.api.notice_of_departure.dto import NOD_MODEL, NOD_MODEL_LIST, CREATE_NOD_MODEL
from app.api.mines.permits.permit.models.permit import Permit


class NoticeOfDepartureListResource(Resource, UserMixin):

    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(NOD_MODEL_LIST, code=200)
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'permit_guid',
            type=str,
            help='Filter by permit',
            location='args',
            required=False,
            store_missing=False)
        parser.add_argument(
            'mine_guid',
            type=str,
            help='Filter by mine',
            location='args',
            required=False,
            store_missing=False)
        parser.add_argument(
            'order_by',
            type=OrderBy,
            help='order by',
            location='args',
            choices=list(OrderBy),
            store_missing=False)
        parser.add_argument(
            'order',
            type=Order,
            help='order direction',
            location='args',
            choices=list(Order),
            store_missing=False)
        parser.add_argument(
            'page', type=int, help='page for pagination', location='args', store_missing=False)
        parser.add_argument(
            'per_page', type=int, help='records per page', location='args', store_missing=False)
        args = parser.parse_args()

        nods = []

        permit_guid = args.get('permit_guid')
        mine_guid = args.get('mine_guid')
        page = args.get('page')
        per_page = args.get('per_page') if args.get('per_page') else 10 # default per page is 10

        order_by = str(OrderBy.update_timestamp) if args.get('order_by') == None else str(
            args.get('order_by'))
        order = str(Order.desc) if args.get('order') == None else str(args.get('order'))
        nods = NoticeOfDeparture.find_all(mine_guid, permit_guid, order_by, order, page, per_page)
        return nods

    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    @api.expect(CREATE_NOD_MODEL)
    @api.marshal_with(NOD_MODEL, code=201)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'nod_title',
            type=inputs.regex('^.{1,50}$'),
            help='Notice of Departure title (50 chars max)',
            location='json',
            required=True,
            store_missing=False)
        parser.add_argument(
            'mine_guid',
            type=str,
            help='Mine identifier',
            location='json',
            required=True,
            store_missing=False)
        parser.add_argument(
            'permit_guid',
            type=str,
            help='Permit identifier',
            location='json',
            required=True,
            store_missing=False)
        parser.add_argument(
            'nod_description',
            type=str,
            help='Notice of Departure description',
            location='json',
            required=True,
            store_missing=False)
        parser.add_argument(
            'nod_type',
            type=NodType,
            help='Notice of Departure type',
            location='json',
            required=True,
            choices=list(NodType),
            store_missing=False)
        parser.add_argument(
            'nod_status',
            type=NodStatus,
            help='Notice of Departure status',
            location='json',
            choices=list(NodStatus),
            store_missing=False)
        data = parser.parse_args()

        permit_guid = data.get('permit_guid')
        mine_guid = data.get('mine_guid')

        permit = Permit.find_by_permit_guid(permit_guid, mine_guid)

        if not permit:
            raise NotFound('Either permit does not exist or does not belong to the mine')
        new_nod = NoticeOfDeparture.create(
            permit._context_mine,
            permit,
            nod_title=data.get('nod_title'),
            nod_description=data.get('nod_description'),
            nod_type=data.get('nod_type'),
            nod_status=NodStatus.pending_review
            if data.get('nod_status') == None else data.get('nod_status'))
        new_nod.save()

        return new_nod
