from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound

from app.api.mines.permits.permit_conditions.models import PermitConditionCategory
from app.api.mines.response_models import PERMIT_CONDITION_CATEGORY_MODEL
from app.api.users.models.user import User
from app.api.utils.access_decorators import requires_role_edit_standard_permit_conditions, \
    requires_role_view_all, EDIT_STANDARD_PERMIT_CONDITIONS
from app.extensions import db, api, jwt
from app.api.utils.include.user_info import User as UserUtils


class AssignUserToPermitConditionCategory(Resource):
    @api.doc(description='Assign a user to a permit condition category')
    @requires_role_edit_standard_permit_conditions
    @api.marshal_with(PERMIT_CONDITION_CATEGORY_MODEL, code=200)
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

        # Fetch User and PermitConditionCategory instances
        user = User.query.filter_by(sub=user_sub).first()
        category = PermitConditionCategory.query.filter_by(condition_category_code=permit_condition_category_code).first()

        if not user:
            raise NotFound('User not found')
        if not category:
            raise NotFound('PermitConditionCategory not found')

        # Add the association
        if category.assigned_review_user is not user:
            category.user_sub = user.sub
            db.session.commit()

        return category

    @api.doc(description='Unassign a user from a permit condition category')
    @requires_role_view_all
    @api.marshal_with(PERMIT_CONDITION_CATEGORY_MODEL, code=200)
    def put(self):
        user_util = UserUtils()
        parser = reqparse.RequestParser()
        parser.add_argument(
            'condition_category_code',
            type=str,
            location='json',
            required=True,
            help='The permit_condition_category_code from which the user will be unassigned'
        )
        args = parser.parse_args()
        permit_condition_category_code = args.get('condition_category_code')

        # Fetch PermitConditionCategory instance
        category = PermitConditionCategory.query.filter_by(
            condition_category_code=permit_condition_category_code).first()

        user_info = user_util.get_user_raw_info()
        user_sub = user_info.get('sub')

        if not (jwt.validate_roles([EDIT_STANDARD_PERMIT_CONDITIONS]) or user_sub == category.user_sub):
            raise BadRequest('User does not have permission to unassign a reviewer')

        if not category:
            raise NotFound('PermitConditionCategory not found')

        # Remove the association
        if category.user_sub is not None:
            category.user_sub = None
            db.session.commit()

        return category