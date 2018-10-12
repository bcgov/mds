from flask_restplus import abort
from .include.user_info import User


class UserMixin(object):
    def get_user_info(self):
        user = User()
        return user.get_user_username()

    def get_create_update_dict(self):
        return {
            'create_user': self.get_user_info(),
            'update_user': self.get_user_info()
        }


class ErrorMixin(object):
    def create_error_payload(self, error_code, message):
        return {
            'error': {
                'status': error_code,
                'message': message
            }
        }

    def raise_error(self, error_code, message):
        _payload = self.create_error_payload(error_code, message)
        raise abort(error_code, **_payload)
