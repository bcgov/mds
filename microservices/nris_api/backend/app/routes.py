from app.utils.logger import get_logger
from app.extensions import api
from .config import Config

from flask_restplus import Resource
from app.nris.namespace import factorial_ns


def register_routes(app):
    # Set URL rules for resources
    app.add_url_rule('/', endpoint='index')

    # Namespaces
    api.add_namespace(factorial_ns)

    # Healthcheck endpoint
    @api.route('/health')
    class Healthcheck(Resource):
        def get(self):
            return {'success': 'true'}

    # Global Handlers
    @api.errorhandler(Exception)
    def default_error_handler(error):
        get_logger().error(str(error))
        return {
            'message': str(error),
        }, 500