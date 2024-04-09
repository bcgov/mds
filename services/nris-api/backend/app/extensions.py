from flask_caching import Cache
from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

from .config import Config
from .helper import Api

db = SQLAlchemy()
migrate = Migrate(compare_type=True)
jwt = JwtManager(None, os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG'), None, 'RS256', None, None, os.environ.get('JWT_OIDC_AUDIENCE'), None, None, False, False, None, Config.JWT_ROLE_CALLBACK, None)

cache = Cache()

api = Api(
    prefix=f'{Config.BASE_PATH}',
    doc=f'{Config.BASE_PATH}/',
    default='nris_api',
    default_label='NRIS related operations')
