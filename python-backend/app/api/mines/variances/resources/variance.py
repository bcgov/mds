import uuid
import base64
import requests
from werkzeug.exceptions import BadRequest, NotFound

from flask import request, current_app, Response
from flask_restplus import Resource, fields
from app.extensions import api, db

from ...mine.models.mine import Mine
from ....documents.mines.models.mine_document import MineDocument
from ....utils.access_decorators import (requires_any_of, MINE_VIEW, MINE_CREATE,
                                         MINESPACE_PROPONENT)
from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.mine_api_models import VARIANCE_MODEL
from app.api.variances.models.variance import Variance
# The need to access the guid -> id lookup forces an import as the id primary
# key is not available via the API. The interal-only primary key +
# cross-namespace foreign key constraints are interally inconsistent
from app.api.users.core.models.core_user import CoreUser


class MineVarianceResource(Resource, UserMixin, ErrorMixin):
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
            'variance_guid': 'GUID of the variance to fetch'
        })
    @requires_any_of([MINE_VIEW])
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
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    @api.marshal_with(VARIANCE_MODEL, code=200)
    def put(self, mine_guid, variance_guid):
        variance = Variance.find_by_mine_guid_and_variance_guid(mine_guid, variance_guid)
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
        Variance.validate_status_with_other_values(
            status=variance.variance_application_status_code,
            issue=variance.issue_date,
            expiry=variance.expiry_date,
            inspector=variance.inspector_id)

        variance.save()
        return variance
