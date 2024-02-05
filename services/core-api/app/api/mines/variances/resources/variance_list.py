from app.extensions import api
from flask_restx import Resource, fields
from werkzeug.exceptions import BadRequest, NotFound

from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, EDIT_VARIANCE, MINESPACE_PROPONENT, is_minespace_user

from app.api.mines.mine.models.mine import Mine
from app.api.mines.response_models import VARIANCE_MODEL
from app.api.variances.models.variance import Variance

from app.api.parties.party.models.party import Party


class MineVarianceListResource(Resource, UserMixin):
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
        'applicant_guid',
        type=str,
        store_missing=False,
        help='GUID of the party on behalf of which the application was made.')
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
        description='Get a list of all variances for a given mine.',
        params={'mine_guid': 'guid of the mine for which to fetch variances'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(VARIANCE_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        variances = Variance.find_by_mine_guid(mine_guid)

        if variances is None:
            raise BadRequest(
                'Unable to fetch variances. Confirm you\'ve provided a valid mine_guid')

        if len(variances) == 0:
            mine = Mine.find_by_mine_guid(mine_guid)
            if mine is None:
                raise NotFound('Mine')

        return variances

    @api.doc(
        description='Create a new variance for a given mine.',
        params={'mine_guid': 'guid of the mine with which to associate the variances'})
    @api.expect(parser)
    @requires_any_of([EDIT_VARIANCE, MINESPACE_PROPONENT])
    @api.marshal_with(VARIANCE_MODEL, code=200)
    def post(self, mine_guid):
        data = self.parser.parse_args()
        compliance_article_id = data['compliance_article_id']
        received_date = data['received_date']
        inspector_party_guid = data.get('inspector_party_guid')

        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine')

        # A manual check to prevent a stack trace dump on a foreign key /
        # constraint error because global error handling doesn't currently work
        # with these errors
        variance_application_status_code = data.get('variance_application_status_code') or 'REV'
        issue_date = data.get('issue_date')
        expiry_date = data.get('expiry_date')
        Variance.validate_status_with_other_values(
            status=variance_application_status_code,
            issue=issue_date,
            expiry=expiry_date,
            inspector=inspector_party_guid)

        variance = Variance.create(
            compliance_article_id=compliance_article_id,
            mine_guid=mine_guid,
            received_date=received_date,
                                                                               # Optional fields
            variance_application_status_code=variance_application_status_code,
            applicant_guid=data.get('applicant_guid'),
            inspector_party_guid=inspector_party_guid,
            note=data.get('note'),
            parties_notified_ind=data.get('parties_notified_ind'),
            issue_date=issue_date,
            expiry_date=expiry_date)

        if not variance:
            raise BadRequest('Error: Failed to create variance')

        variance.save()

        if is_minespace_user():
            variance.send_variance_application_email()
        return variance
