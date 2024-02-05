import asyncio
from flask_restx import Resource, reqparse, inputs
from werkzeug.exceptions import NotFound
from app.extensions import api
from app.extensions import db
from sqlalchemy.sql import table, column
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL, MINESPACE_PROPONENT,
                                             EDIT_DO)
from app.api.activity.models.activity_notification import ActivityNotification
from app.api.activity.dto import CREATE_ACTIVITY_MODEL, ACTIVITY_NOTIFICATION_MODEL_LIST
from app.api.mines.mine.models.mine import Mine


class ActivityListResource(Resource, UserMixin):

    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(ACTIVITY_NOTIFICATION_MODEL_LIST, code=200)
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'user',
            type=str,
            help='Filter by recipient user',
            location='args',
            required=True,

            store_missing=False)
        parser.add_argument(
            'page', type=int, help='page for pagination', location='args', store_missing=False)
        parser.add_argument(
            'per_page', type=int, help='records per page', location='args', store_missing=False)
        args = parser.parse_args()

        user = args.get('user')
        page = args.get('page')
        per_page = args.get('per_page') if args.get('per_page') else 10  # default per page is 10

        activities = ActivityNotification.find_all_by_recipient(user, page, per_page)
        return activities

    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    @api.expect(CREATE_ACTIVITY_MODEL)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'mine_guid',
            type=inputs.regex('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
            help='Mine identifier',
            location='json',
            required=True,
            store_missing=False)
        parser.add_argument(
            'entity_guid',
            type=inputs.regex('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
            help='Entity identifier',
            location='json',
            required=True,
            store_missing=False)
        parser.add_argument(
            'entity',
            type=str,
            location='json',
            required=True,
            store_missing=False)
        parser.add_argument(
            'message',
            type=str,
            location='json',
            required=True,
            store_missing=False)

        data = parser.parse_args()

        entity = data.get('entity')
        entity_guid = data.get('entity_guid')
        mine_guid = data.get('mine_guid')
        message = data.get('message')

        mine = Mine.find_by_mine_guid(mine_guid)

        document = {
            'message': message,
            'metadata': {
                'mine': {
                    'mine_guid': str(mine.mine_guid),
                    'mine_no': mine.mine_no,
                    'mine_name': mine.mine_name
                },
                'entity': entity,
                'entity_guid': str(entity_guid)
            }
        }
        ActivityNotification.create_many(mine_guid, document)
