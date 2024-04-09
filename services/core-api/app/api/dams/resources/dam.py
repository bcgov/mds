from decimal import Decimal
from flask_restx import Resource, reqparse
from werkzeug.exceptions import NotFound

from app.api.utils.resources_mixins import UserMixin
from app.api.dams.dto import DAM_MODEL, UPDATE_DAM_MODEL
from app.api.utils.access_decorators import EDIT_TSF, MINESPACE_PROPONENT, requires_any_of
from app.api.dams.models.dam import Dam
from app.extensions import api


class DamResource(Resource, UserMixin):
    @api.doc(params={'dam_guid': 'Dam guid.'})
    @requires_any_of([EDIT_TSF, MINESPACE_PROPONENT])
    @api.marshal_with(DAM_MODEL, code=200)
    def get(self, dam_guid):
        dam = Dam.find_one(dam_guid)
        return dam

    @api.doc(params={'dam_guid': 'Dam guid.'})
    @requires_any_of([EDIT_TSF, MINESPACE_PROPONENT])
    @api.expect(UPDATE_DAM_MODEL)
    @api.marshal_with(DAM_MODEL, code=200)
    def patch(self, dam_guid):
        parser = reqparse.RequestParser()

        parser.add_argument(
            'dam_name',
            type=str,
            help='Dam name',
            location='json',
            store_missing=False)
        parser.add_argument(
            'dam_type',
            type=str,
            help='Dam type',
            location='json',
            required=False,
            store_missing=False)
        parser.add_argument(
            'latitude',
            type=lambda x: Decimal(x) if x else None,
            required=False,
            help='Latitude of the dam',
            location='json')
        parser.add_argument(
            'longitude',
            type=lambda x: Decimal(x) if x else None,
            required=False,
            help='Longitude of the dam',
            location='json')
        parser.add_argument(
            'operating_status',
            type=str,
            help='Operating status of the dam',
            location='json',
            required=False)
        parser.add_argument(
            'consequence_classification',
            type=str,
            required=False,
            help='Consequence classification of the dam',
            location='json',
            store_missing=False)
        parser.add_argument(
            'permitted_dam_crest_elevation',
            type=lambda x: Decimal(x) if x else None,
            required=False,
            help='Permitted dam crest elevation',
            location='json',
            store_missing=False)
        parser.add_argument(
            'current_dam_height',
            type=lambda x: Decimal(x) if x else None,
            required=False,
            help='Current dam height',
            location='json',
            store_missing=False)
        parser.add_argument(
            'current_elevation',
            type=lambda x: Decimal(x) if x else None,
            required=False,
            help='Current elevation',
            location='json',
            store_missing=False)
        parser.add_argument(
            'max_pond_elevation',
            type=lambda x: Decimal(x) if x else None,
            required=False,
            help='Max pond elevation',
            location='json',
            store_missing=False)
        parser.add_argument(
            'min_freeboard_required',
            type=lambda x: Decimal(x) if x else None,
            required=False,
            help='Min freeboard required',
            location='json',
            store_missing=False)

        update_dam = Dam.find_one(dam_guid)
        if not update_dam:
            raise NotFound('Dam not found')

        data = parser.parse_args()

        for key, value in data.items():
            if (value is not None):
                setattr(update_dam, key, value)


        update_dam.update()

        return update_dam
