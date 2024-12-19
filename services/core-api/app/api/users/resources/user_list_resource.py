from flask import request, current_app
from flask_restx import Resource
from sqlalchemy import or_

from app.api.users.models.user import User
from app.api.users.response_models import USER_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api


class UserListResource(Resource, UserMixin):
    @api.doc(description="Search and retrieve a list of users based on the search term")
    @requires_role_view_all
    @api.marshal_with(USER_MODEL, code=200, as_list=True)  # `as_list=True` indicates a list is returned
    def get(self):
        """
        Handle GET requests to search for users using the provided search_term as a query parameter.
        """
        # Retrieve the search term from request parameters
        search_term = request.args.get('search_term', '', type=str).strip()

        if not search_term:
            return {"message": "A search term must be provided."}, 400

        try:
            # Perform search on User model with a case-insensitive match on relevant fields
            users = User.query.filter(
                or_(
                    User.email.ilike(f"%{search_term}%"),
                    User.given_name.ilike(f"%{search_term}%"),
                    User.family_name.ilike(f"%{search_term}%"),
                    User.display_name.ilike(f"%{search_term}%"),
                    User.idir_username.ilike(f"%{search_term}%"),
                )
            ).all()

            if not users:
                return []

            return users  # Automatically marshalled into `USER_MODEL` by @api.marshal_with

        except Exception as e:
            # Log any errors that occur during the process
            current_app.logger.error(f"Error while searching users: {str(e)}")
            return {"message": f"An error occurred: {str(e)}"}, 500