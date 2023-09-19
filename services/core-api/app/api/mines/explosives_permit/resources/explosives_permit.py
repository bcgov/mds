from decimal import Decimal
from datetime import datetime
from flask.globals import current_app

from werkzeug.exceptions import NotFound
from flask_restplus import Resource, inputs

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, MINE_ADMIN, requires_role_edit_explosives_permit
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.explosives_permit.response_models import EXPLOSIVES_PERMIT_MODEL
from app.api.mines.explosives_permit.models.explosives_permit import ExplosivesPermit


class ExplosivesPermitResource(Resource, UserMixin):
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
        'application_status',
        type=str,
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
        'decision_reason',
        type=str,
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
        'latitude',
        type=lambda x: Decimal(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'longitude',
        type=lambda x: Decimal(x) if x else None,
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
        'application_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'explosive_magazines',
        type=list,
        location='json',
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
    parser.add_argument(
        'letter_date',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'letter_body',
        type=str,
        store_missing=False,
        required=False,
    )

    @api.doc(
        description='Get an Explosives Permit.',
        params={
            'mine_guid': 'The GUID of the mine the Explosives Permit belongs to.',
            'explosives_permit_guid': 'The GUID of the Explosives Permit to get.'
        })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(EXPLOSIVES_PERMIT_MODEL, code=200)
    def get(self, mine_guid, explosives_permit_guid):
        explosives_permit = ExplosivesPermit.find_by_explosives_permit_guid(explosives_permit_guid)
        if explosives_permit is None:
            raise NotFound('Explosives Permit not found')

        return explosives_permit

    @api.doc(
        description='Update an Explosives Permit.',
        params={
            'mine_guid': 'The GUID of the mine the Explosives Permit belongs to.',
            'explosives_permit_guid': 'The GUID of the Explosives Permit to update.'
        })
    @requires_role_edit_explosives_permit
    @api.marshal_with(EXPLOSIVES_PERMIT_MODEL, code=200)
    def put(self, mine_guid, explosives_permit_guid):
        explosives_permit = ExplosivesPermit.find_by_explosives_permit_guid(explosives_permit_guid)
        if explosives_permit is None:
            raise NotFound('Explosives Permit not found')

        data = self.parser.parse_args()

        letter_date = str(datetime.utcnow())
        letter_body = ""

        explosives_permit.update(
            data.get('permit_guid'), data.get('now_application_guid'),
            data.get('issuing_inspector_party_guid'), data.get('mine_manager_mine_party_appt_id'),
            data.get('permittee_mine_party_appt_id'), data.get('application_status'),
            data.get('issue_date'), data.get('expiry_date'), data.get('decision_reason'),
            data.get('is_closed'), data.get('closed_reason'), data.get('closed_timestamp'),
            data.get('latitude'), data.get('longitude'), data.get('application_date'),
            data.get('description'),
            data.get('letter_date'),
            data.get('letter_body'),
            data.get('explosive_magazines', []),
            data.get('detonator_magazines', []), data.get('documents', []))

        explosives_permit.save()
        return explosives_permit

    @api.doc(
        description='Delete an Explosives Permit.',
        params={
            'mine_guid': 'The GUID of the mine the Explosives Permit belongs to.',
            'explosives_permit_guid': 'The GUID of the Explosives Permit to delete.'
        })
    @requires_any_of([MINE_ADMIN])
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, explosives_permit_guid):
        explosives_permit = ExplosivesPermit.find_by_explosives_permit_guid(explosives_permit_guid)
        if explosives_permit is None:
            raise NotFound('Explosives Permit not found')

        explosives_permit.delete()
        return None, 204
