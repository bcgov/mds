import uuid
import base64
import requests
from werkzeug.exceptions import BadRequest, NotFound

from flask import request, current_app, Response
from flask_restplus import Resource, fields
from app.extensions import api, db

from ..models.variance import Variance
from ...mine.models.mine import Mine
from ....documents.mines.models.mine_document import MineDocument
from ....utils.access_decorators import (requires_any_of, MINE_VIEW, MINE_CREATE,
                                         MINESPACE_PROPONENT)
from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.mine_api_models import VARIANCE_MODEL
# The need to access the guid -> id lookup forces an import as the id primary
# key is not available via the API. The interal-only primary key +
# cross-namespace foreign key constraints are interally inconsistent
from app.api.users.core.models.core_user import CoreUser


class VarianceResource(Resource, UserMixin, ErrorMixin):
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
        'ohsc_ind',
        type=bool,
        store_missing=False,
        help='Indicates if variance application has been reviewed by the OHSC.')
    parser.add_argument(
        'union_ind',
        type=bool,
        store_missing=False,
        help='Indicates if variance application has been reviewed by the union.')
    parser.add_argument(
        'inspector_guid',
        type=str,
        store_missing=False,
        help='GUID of the user who inspected the mine during the variance application process.')
    parser.add_argument(
        'note',
        type=str,
        store_missing=False,
        help='A note to include on the variance. Limited to 300 characters.')
    parser.add_argument(
        'issue_date', store_missing=False, help='The date on which the variance was issued.')
    parser.add_argument(
        'expiry_date', store_missing=False, help='The date on which the variance expires.')


    @api.doc(
        description='Get a single variance.',
        params={
            'mine_guid': 'GUID of the mine to which the variance is associated',
            'variance_id': 'ID of the variance to fetch'
        })
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(VARIANCE_MODEL, code=200)
    def get(self, mine_guid, variance_id):
        variance = Variance.find_by_mine_guid_and_variance_id(mine_guid, variance_id)

        if variance is None:
            raise NotFound('Unable to fetch variance')

        return variance


    @api.doc(
        description='Update a variance.',
        params={
            'mine_guid': 'GUID of the mine to which the variance is associated',
            'variance_id': 'ID of the variance to update'
        })
    @requires_any_of([MINE_CREATE])
    @api.marshal_with(VARIANCE_MODEL, code=200)
    def put(self, mine_guid, variance_id):
        variance = Variance.find_by_mine_guid_and_variance_id(mine_guid, variance_id)
        if variance is None:
            raise NotFound('Unable to fetch variance')

        data = self.parser.parse_args()

        core_user_guid = data.get('inspector_guid')
        if core_user_guid:
            core_user = CoreUser.find_by_core_user_guid(core_user_guid)
            if not core_user:
                raise BadRequest('Unable to find new inspector.')

            variance.inspector_id = core_user.core_user_id

        for key, value in data.items():
            if key in ['inspector_guid']:
                continue
            setattr(variance, key, value)

        # A manual check to prevent a stack trace dump on a foreign key /
        # constraint error because global error handling doesn't currently work
        # with these errors
        if variance.variance_application_status_code == 'APP':
            if variance.expiry_date is None:
                raise AssertionError('Expiry date required for approved variance.')
            if variance.issue_date is None:
                raise AssertionError('Issue date required for approved variance.')
            if variance.inspector_id is None:
                raise AssertionError('Inspector required for approved variance.')

        if variance.variance_application_status_code == 'DEN':
            if variance.inspector_id is None:
                raise AssertionError('Inspector required for reviewed variance.')

        if variance.variance_application_status_code in ['REV', 'NAP', 'DEN']:
            if variance.expiry_date is not None:
                raise AssertionError('Expiry date forbidden unless variance is approved.')
            if variance.issue_date is not None:
                raise AssertionError('Issue date forbidden unless variance is approved.')

        variance.save()
        return variance
