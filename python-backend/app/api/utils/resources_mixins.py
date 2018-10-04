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
