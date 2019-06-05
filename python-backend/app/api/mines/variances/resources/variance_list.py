from app.extensions import api
from flask_restplus import Resource, fields
from werkzeug.exceptions import BadRequest, NotFound

from ....utils.access_decorators import requires_any_of, MINE_VIEW, MINE_CREATE, MINESPACE_PROPONENT
from ...mine.models.mine import Mine
from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.mine_api_models import VARIANCE_MODEL
from app.api.variances.models.variance import Variance

# The need to access the guid -> id lookup forces an import as the id primary
# key is not available via the API. The interal-only primary key +
# cross-namespace foreign key constraints are interally inconsistent
from app.api.users.core.models.core_user import CoreUser


class MineVarianceListResource(Resource, UserMixin, ErrorMixin):
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
        description='Get a list of all variances for a given mine.',
        params={'mine_guid': 'guid of the mine for which to fetch variances'})
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
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
    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    @api.marshal_with(VARIANCE_MODEL, code=200)
    def post(self, mine_guid):
        data = self.parser.parse_args()
        compliance_article_id = data['compliance_article_id']
        received_date = data['received_date']
        core_user_guid = data.get('inspector_guid')
        inspector_id = None

        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine')

        if core_user_guid:
            core_user = CoreUser.find_by_core_user_guid(core_user_guid)
            if not core_user:
                raise BadRequest('Unable to find inspector.')

            inspector_id = core_user.core_user_id

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
            inspector=inspector_id)

        variance = Variance.create(
            compliance_article_id=compliance_article_id,
            mine_guid=mine_guid,
            received_date=received_date,
            # Optional fields
            variance_application_status_code=variance_application_status_code,
            applicant_guid=data.get('applicant_guid'),
            inspector_id=inspector_id,
            note=data.get('note'),
            issue_date=issue_date,
            expiry_date=expiry_date)

        if not variance:
            raise BadRequest('Error: Failed to create variance')

        variance.save()
        return variance
