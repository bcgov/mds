from datetime import datetime

from flask import current_app
from flask_restx import Resource
from pytz import utc

from app.api.users.models.user import User
from app.api.users.response_models import USER_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.include.user_info import User as UserUtils
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api


class UserResource(Resource, UserMixin):
    @api.doc(description='Update and retrieve the user from the token')
    @requires_role_view_all
    @api.marshal_with(USER_MODEL, code=200)
    def get(self):
        user_util = UserUtils()

        user_info = user_util.get_user_raw_info()

        try:
            # Extract token information
            user_data = {
                "sub": user_info.get("sub"),
                "email": user_info.get("email", ""),
                "given_name": user_info.get("given_name", ""),
                "family_name": user_info.get("family_name", ""),
                "display_name": user_info.get("display_name", ""),
                "idir_username": user_info.get("idir_username", ""),
                "identity_provider": user_info.get("identity_provider", ""),
                "idir_user_guid": user_info.get("idir_user_guid", ""),
                "last_logged_in": datetime.now(tz=utc),
            }

            user = User.create_or_update_user(**user_data)

            return user

        except Exception as e:
            current_app.logger.error(f'Error: {str(e)}')
            return {"message": f"An error occurred: {str(e)}"}, 500