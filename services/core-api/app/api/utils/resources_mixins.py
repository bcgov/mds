from flask_restx import abort
from .include.user_info import User


class UserMixin(object):
    def get_user_info(self):
        user = User()
        return user.get_user_username()
