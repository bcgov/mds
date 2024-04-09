import uuid

from flask import request, current_app
from app.api.utils.include.user_info import User
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin

from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine
from app.api.users.response_models import MINESPACE_USER_MODEL
from app.api.mines.mine.models.mine import Mine


class UserResource(Resource, UserMixin):
    def get(self):
        user = User()
        
        user_info = user.get_user_raw_info()
        user_info['preferred_username'] = user.get_user_username()

        return user_info
