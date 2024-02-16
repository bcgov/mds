from app.nris.utils.logger import get_logger
from app.extensions import api
from flask import current_app
from .config import Config

from flask_jwt_oidc.exceptions import AuthError

from flask_restx import Resource


def register_routes(app):
    # Set URL rules for resources
    app.add_url_rule('/', endpoint='index')

    # Healthcheck endpoint
    @api.route('/health')
    class Healthcheck(Resource):
        def get(self):
            return {'status': 'pass'}

    # Global Handlers
    @api.errorhandler(AuthError)
    def jwt_oidc_auth_error_handler(error):
        return {
            'status': getattr(error, 'status_code', 401),
            'message': str(error),
        }, getattr(error, 'status_code', 401)

    @api.errorhandler(Exception)
    def default_error_handler(error):
        if getattr(error, 'code', 500) == 500:
            current_app.logger.error(str(error))
        return {
            'status': getattr(error, 'code', 500),
            'message': str(error),
        }, getattr(error, 'code', 500)