import uuid, base64, requests
from werkzeug.exceptions import BadRequest, NotFound

from flask import request, current_app, Response
from flask_restx import Resource, fields
from app.extensions import api, db

from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL, MINE_EDIT, EDIT_VARIANCE,
                                             MINESPACE_PROPONENT)
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.variances.models.variance import Variance
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.party_business_role_appt import PartyBusinessRoleAppointment
from app.api.mines.response_models import VARIANCE_MODEL
from app.api.utils.access_decorators import requires_role_mine_admin


class MineVarianceResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'compliance_article_id',
        type=int,
        store_missing=False,
        help='ID representing the MA or HSRCM code to which this variance relates.')
    parser.add_argument(
        'received_date',
        store_missing=False,
        help='The date on which the variance application was received.')
    parser.add_argument(
        'variance_application_status_code',
        type=str,
        store_missing=False,
        help='A 3-character code indicating the status type of the variance. Default: REV')
    parser.add_argument(
        'inspector_party_guid',
        type=str,
        store_missing=False,
        help='GUID of the party who inspected the mine during the variance application process.')
    parser.add_argument(
        'note',
        type=str,
        store_missing=False,
        help='A note to include on the variance. Limited to 300 characters.')
    parser.add_argument(
        'parties_notified_ind',
        type=bool,
        store_missing=False,
        help='Indicates if the relevant parties have been notified of variance request and decision.'
    )
    parser.add_argument(
        'issue_date', store_missing=False, help='The date on which the variance was issued.')
    parser.add_argument(
        'expiry_date', store_missing=False, help='The date on which the variance expires.')

    @api.doc(
        description='Get a single variance.',
        params={
            'mine_guid': 'GUID of the mine to which the variance is associated',
            'variance_guid': 'GUID of the variance to fetch'
        })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(VARIANCE_MODEL, code=200)
    def get(self, mine_guid, variance_guid):
        variance = Variance.find_by_mine_guid_and_variance_guid(mine_guid, variance_guid)

        if variance is None:
            raise NotFound('Unable to fetch variance')

        return variance

    @api.doc(
        description='Update a variance.',
        params={
            'mine_guid': 'GUID of the mine to which the variance is associated',
            'variance_guid': 'GUID of the variance to update'
        })
    @requires_any_of([EDIT_VARIANCE, MINESPACE_PROPONENT])
    @api.marshal_with(VARIANCE_MODEL, code=200)
    def put(self, mine_guid, variance_guid):
        variance = Variance.find_by_mine_guid_and_variance_guid(mine_guid, variance_guid)
        if variance is None:
            raise NotFound('Unable to fetch variance')

        data = self.parser.parse_args()

        inspector_party_guid = data.get('inspector_party_guid')
        if inspector_party_guid:
            inspector = Party.find_by_party_guid(inspector_party_guid)
            if not inspector:
                raise BadRequest('Unable to find new inspector.')
            if not 'INS' in inspector.business_roles_codes:
                raise BadRequest('Party is not an inspector.')

            variance.inspector_party_guid = inspector_party_guid

        for key, value in data.items():
            if key in ['inspector_party_guid']:
                continue
            setattr(variance, key, value)

        # A manual check to prevent a stack trace dump on a foreign key /
        # constraint error because global error handling doesn't currently work
        # with these errors
        Variance.validate_status_with_other_values(
            status=variance.variance_application_status_code,
            issue=variance.issue_date,
            expiry=variance.expiry_date,
            inspector=variance.inspector_party_guid)

        variance.save()
        return variance

    @api.doc(
        description='Delete a variance.',
        params={
            'mine_guid': 'GUID of the mine to which the variance is associated',
            'variance_guid': 'GUID of the variance to delete'
        })
    @requires_role_mine_admin
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, variance_guid):
        variance = Variance.find_by_mine_guid_and_variance_guid(mine_guid, variance_guid)
        if variance is None:
            raise NotFound('Mine variance not found')
        variance.delete()
        return None, 204