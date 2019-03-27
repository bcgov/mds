import uuid
from flask import request
from flask_restplus import Resource, reqparse
from sqlalchemy_filters import apply_pagination
from sqlalchemy.exc import DBAPIError

# TODO: Make this singular
from ..models.variances import Variance
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create, requires_role_mine_admin
from ....utils.resources_mixins import UserMixin, ErrorMixin


class VarianceResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('compliance_article_id',
                        type=int,
                        help='ID representing the MA or HSRCM code to which this variance relates.')
    parser.add_argument('mine_guid',
                        type=str,
                        help='guid representing the mine to which this variance relates.')
    parser.add_argument('note',
                        type=str,
                        help='A note to include on the variance. Limited to 300 characters.')
    parser.add_argument('issue_date',
                        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
                        help='The date on which the variance was issued.')
    parser.add_argument('received_date',
                        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
                        help='The date on which the variance was received.')
    parser.add_argument('expiry_date',
                        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
                        help='The date on which the variance expires.')


    @api.doc(params={})
    @requires_role_mine_view
    def get(self, mine_guid=None):
        if not mine_guid:
            return self.create_error_payload(422, 'Missing mine_guid'), 422

        try:
            variances = Variance.find_by_mine_guid(mine_guid)
        except DBAPIError:
            return self.create_error_payload(422, 'Invalid mine_guid'), 422
        if variances != None:
            return { 'records': [x.json() for x in variances] }
        else:
            return self.create_error_payload(404, 'Unable to fetch variances'), 404


    # FIXME Copied code
    @api.expect(parser)
    @requires_role_mine_create
    def post(self, party_guid=None):
        if party_guid:
            self.raise_error(400, 'Error: Unexpected party id in Url.')
        data = PartyResource.parser.parse_args()

        try:
            party = Party.create(
                data['party_name'],
                data['phone_no'],
                data['type'],
                # Nullable fields
                email=data.get('email'),
                first_name=data.get('first_name'),
                phone_ext=data.get('phone_ext'),
                suite_no=data.get('suite_no'),
                address_line_1=data.get('address_line_1'),
                address_line_2=data.get('address_line_2'),
                city=data.get('city'),
                sub_division_code=data.get('sub_division_code'),
                post_code=data.get('post_code'))
        except KeyError as e:
            self.raise_error(400, 'Error: Missing value for required field(s)')
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))

        if not party:
            self.raise_error(400, 'Error: Failed to create party')

        party.save()
        return party.json()
