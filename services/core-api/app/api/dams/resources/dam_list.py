from decimal import Decimal
from flask_restplus import Resource, reqparse
from werkzeug.exceptions import NotFound

from app.api.dams.dto import DAM_MODEL, CREATE_DAM_MODEL, DAM_MODEL_LIST
from app.api.dams.models.dam import Dam
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, EDIT_DO)
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api


class DamListResource(Resource, UserMixin):

    @api.doc(description='Get a list of dams.')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(DAM_MODEL_LIST, code=200)
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'mine_tailings_storage_facility_guid',
            type=str,
            help='Filter by mine tailings storage facility',
            location='args',
            required=False,
            store_missing=False)

        args = parser.parse_args()
        tsf_guid = args.get('mine_tailings_storage_facility_guid')
        dams = Dam.find_all(tsf_guid)
        return dams

    @requires_any_of([EDIT_DO, MINESPACE_PROPONENT])
    @api.expect(CREATE_DAM_MODEL)
    @api.marshal_with(DAM_MODEL, code=201)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'mine_tailings_storage_facility_guid',
            type=str,
            required=True,
            help='Guid for the connected Tailings Storage Facility',
            location='json')
        parser.add_argument(
            'dam_type',
            type=str,
            help='Dam type',
            location='json',
            required=True,
            store_missing=False)
        parser.add_argument(
            'dam_name',
            type=str,
            required=True,
            help='Dam name',
            location='json')
        parser.add_argument(
            'latitude',
            type=lambda x: Decimal(x) if x else None,
            required=True,
            help='Latitude of the dam',
            location='json')
        parser.add_argument(
            'longitude',
            type=lambda x: Decimal(x) if x else None,
            required=True,
            help='Longitude of the dam',
            location='json')
        parser.add_argument(
            'operating_status',
            type=str,
            help='Operating status of the dam',
            location='json',
            required=True)
        parser.add_argument(
            'consequence_classification',
            type=str,
            required=True,
            help='Consequence classification of the dam',
            location='json',
            store_missing=False)
        parser.add_argument(
            'permitted_dam_crest_elevation',
            type=lambda x: Decimal(x) if x else None,
            required=True,
            help='Permitted dam crest elevation',
            location='json',
            store_missing=False)
        parser.add_argument(
            'current_dam_height',
            type=lambda x: Decimal(x) if x else None,
            required=True,
            help='Current dam height',
            location='json',
            store_missing=False)
        parser.add_argument(
            'current_elevation',
            type=lambda x: Decimal(x) if x else None,
            required=True,
            help='Current elevation',
            location='json',
            store_missing=False)
        parser.add_argument(
            'max_pond_elevation',
            type=lambda x: Decimal(x) if x else None,
            required=True,
            help='Max pond elevation',
            location='json',
            store_missing=False)
        parser.add_argument(
            'min_freeboard_required',
            type=lambda x: Decimal(x) if x else None,
            required=True,
            help='Min freeboard required',
            location='json',
            store_missing=False)

        data = parser.parse_args()

        tsf_guid = data.get('mine_tailings_storage_facility_guid')

        tsf = MineTailingsStorageFacility.find_by_tsf_guid(tsf_guid)

        if not tsf:
            raise NotFound('Tailings Storage Facility not found')

        new_dam = Dam.create(
            tailings_storage_facility=tsf,
            dam_type=data.get('dam_type'),
            dam_name=data.get('dam_name'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            operating_status=data.get('operating_status'),
            consequence_classification=data.get('consequence_classification'),
            permitted_dam_crest_elevation=data.get('permitted_dam_crest_elevation'),
            current_dam_height=data.get('current_dam_height'),
            current_elevation=data.get('current_elevation'),
            max_pond_elevation=data.get('max_pond_elevation'),
            min_freeboard_required=data.get('min_freeboard_required'))

        new_dam.save()

        return new_dam
