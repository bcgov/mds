from werkzeug.exceptions import BadRequest

from flask_restplus import Resource, fields
from app.extensions import api

from ..models.variance import Variance
from ....utils.access_decorators import requires_any_of, MINE_VIEW, MINE_CREATE
from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.mine_api_models import VARIANCE_MODEL


class VarianceListResource(Resource, UserMixin, ErrorMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'compliance_article_id',
        type=int,
        store_missing=False,
        help='ID representing the MA or HSRCM code to which this variance relates.',
        required=True)
    parser.add_argument(
        'received_date',
        store_missing=False,
        help='The date on which the variance application was received.',
        required=True)
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
        description='Get a list of all variances for a given mine.',
        params={'mine_guid': 'guid of the mine for which to fetch variances'})
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(VARIANCE_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        variances = Variance.find_by_mine_guid(mine_guid)

        if variances is None:
            raise BadRequest(
                'Unable to fetch variances. Confirm you\'ve provided a valid mine_guid')

        return variances


    @api.doc(
        description='Create a new variance for a given mine.',
        params={'mine_guid': 'guid of the mine with which to associate the variances'})
    @api.expect(parser)
    @requires_any_of([MINE_CREATE])
    @api.marshal_with(VARIANCE_MODEL, code=200)
    def post(self, mine_guid):
        data = self.parser.parse_args()
        compliance_article_id = data['compliance_article_id']
        received_date = data['received_date']

        variance = Variance.create(
            compliance_article_id=compliance_article_id,
            mine_guid=mine_guid,
            received_date=received_date,
            # Optional fields
            variance_application_status_code=data.get('variance_application_status_code'),
            ohsc_ind=data.get('ohsc_ind'),
            union_ind=data.get('union_ind'),
            inspector_id=data.get('inspector_id'),
            note=data.get('note'),
            issue_date=data.get('issue_date'),
            expiry_date=data.get('expiry_date'))

        if not variance:
            raise BadRequest('Error: Failed to create variance')

        variance.save()
        return variance
