from datetime import datetime
from flask_restplus import Resource, reqparse, fields
from sqlalchemy.exc import DBAPIError
from werkzeug.exceptions import BadRequest, NotFound

from ..models.variance import Variance
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin

mine_document_model = api.model('MineDocument', {
    'mine_document_guid': fields.String,
    'mine_guid': fields.String,
    'document_manager_guid': fields.String,
    'document_name': fields.String, # TODO: update references to filename to be document_name
    'active_ind': fields.Boolean
})

variance_document_model = api.model('VarianceDocument', {
    'variance_document_xref_guid': fields.String,
    'variance_id': fields.Integer,
    'mine_document_guid': fields.String,
    'details': fields.Nested(mine_document_model)
})

variance_model = api.model('Variance', {
    'variance_id': fields.Integer,
    'compliance_article_id': fields.Integer,
    'note': fields.String,
    'issue_date': fields.Date,
    'received_date': fields.Date,
    'expiry_date': fields.Date,
    'related_documents': fields.List(fields.Nested(variance_document_model))
})

class VarianceResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('compliance_article_id',
                        type=int,
                        store_missing=False,
                        trim=True,
                        help='ID representing the MA or HSRCM code to which this variance relates.')
    parser.add_argument('note',
                        type=str,
                        store_missing=False,
                        trim=True,
                        help='A note to include on the variance. Limited to 300 characters.')
    parser.add_argument('issue_date',
                        store_missing=False,
                        trim=True,
                        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
                        help='The date on which the variance was issued.')
    parser.add_argument('received_date',
                        store_missing=False,
                        trim=True,
                        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
                        help='The date on which the variance was received.')
    parser.add_argument('expiry_date',
                        store_missing=False,
                        trim=True,
                        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
                        help='The date on which the variance expires.')


    @api.doc(
        description=
        'This endpoint returns a list of all variances for a given mine.',
        params={
            'mine_guid': 'guid of the mine for which to fetch variances'
        }
    )
    @requires_role_mine_view
    @api.marshal_with(variance_model, code=200, envelope='records')
    def get(self, mine_guid=None):
        if not mine_guid:
            raise BadRequest('Missing mine_guid')

        try:
            variances = Variance.find_by_mine_guid(mine_guid)
        except DBAPIError:
            raise BadRequest('Invalid mine_guid')

        if variances is None:
            raise BadRequest('Unable to fetch variances')

        return variances


    @api.doc(
        description=
        'This endpoint creates a new variance for a given mine.',
        params={
            'mine_guid': 'guid of the mine with which to associate the variances'
        }
    )
    @api.expect(parser)
    @requires_role_mine_create
    @api.marshal_with(variance_model, code=200)
    def post(self, mine_guid=None):
        if not mine_guid:
            raise BadRequest('Must provide mine_guid')

        data = VarianceResource.parser.parse_args()
        compliance_article_id = data['compliance_article_id']

        if not compliance_article_id:
            raise BadRequest('Must provide compliance_article_id')

        variance = Variance.create(
            compliance_article_id,
            mine_guid,
            # Optional fields
            note=data.get('note'),
            issue_date=data.get('issue_date'),
            received_date=data.get('received_date'),
            expiry_date=data.get('expiry_date'))

        if not variance:
            raise BadRequest('Error: Failed to create variance')

        variance.save()
        return variance
