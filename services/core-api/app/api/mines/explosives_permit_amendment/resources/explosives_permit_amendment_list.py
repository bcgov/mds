from flask_restplus import Resource, inputs
from werkzeug.exceptions import NotFound
from decimal import Decimal

from app.api.mines.explosives_permit_amendment.models.explosives_permit_amendment import ExplosivesPermitAmendment
from app.api.mines.explosives_permit_amendment.response_models import EXPLOSIVES_PERMIT_AMENDMENT_MODEL
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import requires_role_edit_explosives_permit
from app.api.mines.mine.models.mine import Mine



class ExplosivesPermitAmendmentListResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'permit_guid',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'now_application_guid',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'explosives_permit_id',
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
        description='Create a new Explosives Permit Amendment.',
        params={'mine_guid': 'The GUID of the mine to create the Explosives Permit Amendment for.'})
    @api.expect(parser)
    @requires_role_edit_explosives_permit
    @api.marshal_with(EXPLOSIVES_PERMIT_AMENDMENT_MODEL, code=201)
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()
        explosives_permit_amendment = ExplosivesPermitAmendment.create(mine,
            data.get('permit_guid'),
            data.get('explosives_permit_id'),
            data.get('application_date'),
            data.get('originating_system'),
            data.get('latitude'), data.get('longitude'),
            data.get('description'), data.get('issue_date'),
            data.get('expiry_date'),
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
        explosives_permit_amendment.save()

        return explosives_permit_amendment, 201
