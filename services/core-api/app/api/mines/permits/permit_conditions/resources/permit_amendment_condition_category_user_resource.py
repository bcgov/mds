from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound, Unauthorized

from app.api.mines.permits.permit_conditions.models import PermitConditionCategory
from app.api.mines.permits.permit_conditions.models.permit_condition_review_assignment import PermitConditionReviewAssignment
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.response_models import PERMIT_CONDITION_REVIEW_ASSIGNMENT_MODEL
from app.api.users.models.user import User
from app.api.utils.access_decorators import requires_role_edit_standard_permit_conditions, \
    requires_role_view_all, EDIT_STANDARD_PERMIT_CONDITIONS
from app.extensions import api, jwt
from app.api.utils.include.user_info import User as UserUtils


class AssignUserToPermitConditionCategory(Resource):
    @api.doc(
            description="Get a list of review assignments",
            params={'permit_amendment_id': "The permit amendment for the reviewer assignment"})
    @requires_role_view_all
    @api.marshal_with(PERMIT_CONDITION_REVIEW_ASSIGNMENT_MODEL, envelope='records', code=200)
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'permit_amendment_id',
            type=int,
            location='args',
            required=True,
            help='The permit amendment for the reviewer assignment'
        )
        args = parser.parse_args()
        permit_amendment_id = args.get('permit_amendment_id')
        assignments = PermitConditionReviewAssignment.get_by_permit_amendment_id(permit_amendment_id)
        return assignments

    @api.doc(
            description='Assign a user to a permit condition category',
            params={
                'assigned_review_user': 'The user sub to be assigned to a permit condition category',
                'permit_amendment_id': 'The permit amendment for the reviewer assignment',
                'condition_category_code': 'The permit_condition_category_code to which a user will be assigned'  })
    @requires_role_edit_standard_permit_conditions
    @api.marshal_with(PERMIT_CONDITION_REVIEW_ASSIGNMENT_MODEL, code=200)
    def post(self):
        parser = reqparse.RequestParser()

        parser.add_argument(
            'assigned_review_user',
            type=str,
            location='json',
            required=True,
            help='The user sub to be assigned to a permit condition category'
        )
        parser.add_argument(
            'permit_amendment_id',
            type=int,
            location='json',
            required=True,
            help='The permit amendment for the reviewer assignment'
        )
        parser.add_argument(
            'condition_category_code',
            type=str,
            location='json',
            required=True,
            help='The permit_condition_category_code to which a user will be assigned'
        )
        args = parser.parse_args()
        """Assign a user to a permit condition category"""
        user_sub = args.get('assigned_review_user')
        permit_condition_category_code = args.get('condition_category_code')
        permit_amendment_id = args.get('permit_amendment_id')

        # Fetch User and PermitConditionCategory instances
        user = User.query.filter_by(sub=user_sub).first()
        category = PermitConditionCategory.query.filter_by(condition_category_code=permit_condition_category_code).first()
        permit_amendment = PermitAmendment.find_by_permit_amendment_id(permit_amendment_id)
        
        if not user:
            raise NotFound('User not found')
        if not category:
            raise NotFound('PermitConditionCategory not found')
        if not permit_amendment:
            raise NotFound('Permit Amendment not found')
        if category.permit_amendment_id is not None and category.permit_amendment_id != permit_amendment_id:
            raise BadRequest('Category is associated with another permit amendment')

        assignment = PermitConditionReviewAssignment.create_or_update(permit_amendment_id, permit_condition_category_code, user_sub)

        return assignment

    @api.doc(
            description='Unassign a user from a permit condition category',
            params={'condition_review_assignment_guid': 'The guid of the assignment to unassign'})
    @requires_role_view_all
    @api.marshal_with(PERMIT_CONDITION_REVIEW_ASSIGNMENT_MODEL, code=200)
    def put(self):
        user_util = UserUtils()
        parser = reqparse.RequestParser()
        parser.add_argument(
            'condition_review_assignment_guid',
            type=str,
            location='json',
            required=True,
            help='The guid of the assignment to unassign'
        )

        args = parser.parse_args()
        condition_review_assignment_guid = args.get('condition_review_assignment_guid')

        # fetch review assignment
        review_assignment = PermitConditionReviewAssignment.get_by_assignment_guid(condition_review_assignment_guid)

        if review_assignment is None:
            raise NotFound('Review assignment not found')
        
        user_info = user_util.get_user_raw_info()
        user_sub = user_info.get('sub')
        if not (jwt.validate_roles([EDIT_STANDARD_PERMIT_CONDITIONS]) or user_sub == review_assignment.assigned_review_user.user_sub):
            raise Unauthorized('User does not have permission to unassign a reviewer')


        # Remove the association
        review_assignment.unassign_review_user()