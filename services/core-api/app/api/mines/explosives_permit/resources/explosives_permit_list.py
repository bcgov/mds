from flask_restplus import Resource, inputs
from werkzeug.exceptions import NotFound
from decimal import Decimal

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, requires_role_edit_explosives_permit
from app.api.mines.mine.models.mine import Mine
from app.api.mines.explosives_permit.response_models import EXPLOSIVES_PERMIT_MODEL
from app.api.mines.explosives_permit.models.explosives_permit import ExplosivesPermit
from sqlalchemy import exc
from app.api.mines.exceptions.mine_exceptions import MineException, ExplosivePermitNumberAlreadyExistExeption
from flask import current_app

class ExplosivesPermitListResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'permit_guid',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'now_application_guid',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'originating_system',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'latitude',
        type=lambda x: Decimal(x) if x else None,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'longitude',
        type=lambda x: Decimal(x) if x else None,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'application_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'explosive_magazines',
        type=list,
        location='json',
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'description',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'issuing_inspector_party_guid',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'mine_manager_mine_party_appt_id',
        type=int,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'permittee_mine_party_appt_id',
        type=int,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'is_closed',
        type=inputs.boolean,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'closed_reason',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'closed_timestamp',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'issue_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'expiry_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'permit_number',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'detonator_magazines',
        type=list,
        location='json',
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'documents',
        type=list,
        location='json',
        store_missing=False,
        required=False,
    )

    @api.doc(
        description='Get a list of all Explosives Permits for a given mine.',
        params={'mine_guid': 'The GUID of the mine to get Explosives Permits for.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(EXPLOSIVES_PERMIT_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        try:
            mine = Mine.find_by_mine_guid(mine_guid)
            if mine is None:
                raise NotFound('Mine not found')

            explosives_permits = ExplosivesPermit.find_by_mine_guid(mine_guid)

        except Exception as e:
            current_app.logger.error(e)
            raise MineException("Oops!, Something went wrong while retrieving the mine information",
                                detailed_error = e)

        else:
            return explosives_permits

    @api.doc(
        description='Create a new Explosives Permit.',
        params={'mine_guid': 'The GUID of the mine to create the Explosives Permit for.'})
    @api.expect(parser)
    @requires_role_edit_explosives_permit
    @api.marshal_with(EXPLOSIVES_PERMIT_MODEL, code=201)
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        try:
            data = self.parser.parse_args()
            explosives_permit = ExplosivesPermit.create(mine, data.get('permit_guid'),
                                                        data.get('application_date'),
                                                        data.get('originating_system'),
                                                        data.get('latitude'), data.get('longitude'),
                                                        data.get('description'), data.get('issue_date'),
                                                        data.get('expiry_date'),
                                                        data.get('permit_number'),
                                                        data.get('issuing_inspector_party_guid'),
                                                        data.get('mine_manager_mine_party_appt_id'),
                                                        data.get('permittee_mine_party_appt_id'),
                                                        data.get('is_closed'),
                                                        data.get('closed_reason'),
                                                        data.get('closed_timestamp'),
                                                        data.get('explosive_magazines', []),
                                                        data.get('detonator_magazines', []),
                                                        data.get('documents', []),
                                                        data.get('now_application_guid'))
            explosives_permit.save()

        except exc.IntegrityError as intgErr:
            current_app.logger.error(intgErr)
            is_duplicate_permit_number = \
                "duplicate key value violates unique constraint \"explosives_permit_permit_number_key\"" \
                in str(intgErr.__cause__)
            if is_duplicate_permit_number:
                raise ExplosivePermitNumberAlreadyExistExeption(detailed_error = intgErr)
            else:
                raise MineException("Unexpected error occurred, when creating the esup",
                                    detailed_error = intgErr)

        except Exception as e:
            current_app.logger.error(e)
            raise MineException(detailed_error = e)

        else:
            return explosives_permit, 201
