from app.utils.logger import get_logger
from app.extensions import api
from .config import Config

from app.nris.namespace import factorial_ns


def register_routes(app):
    # Set URL rules for resources
    app.add_url_rule('/', endpoint='index')

    # Namespaces
    api.add_namespace(factorial_ns)

    # Global Handlers
    @api.errorhandler(Exception)
    def default_error_handler(error):
        get_logger().error(str(error))
        return {
            'message': str(error),
        }, 500