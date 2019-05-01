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
        'inspector_id',
        type=int,
        store_missing=False,
        help='ID of the person who inspected the mine during the variance application process.')
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
        variance = Variance.find_by_variance_id(variance_id)

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
        variance = Variance.find_by_variance_id(variance_id)
        if variance is None:
            raise NotFound('Unable to fetch variance')

        data = self.parser.parse_args()
        for key, value in data.items():
            setattr(variance, key, value)

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

        if variance.variance_application_status_code in ['REV', 'NAP']:
            if variance.expiry_date is not None:
                raise AssertionError('Expiry date forbidden for variance application.')
            if variance.issue_date is not None:
                raise AssertionError('Issue date forbidden for variance application.')

        variance.save()
        return variance


class VarianceUploadedDocumentsResource(Resource, UserMixin, ErrorMixin):
    parser = CustomReqparser()
    parser.add_argument('mine_document_guid', type=str, required=True)

    @api.doc(description='Delete a document from a variance.')
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def delete(self, mine_guid, variance_id, mine_document_guid):
        variance = Variance.find_by_variance_id(variance_id)
        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if variance is None:
            raise NotFound('Variance not found.')
        if mine_document is None:
            raise NotFound('Mine document not found.')

        variance.documents.remove(mine_document)
        variance.save()

        return ('', 204)
