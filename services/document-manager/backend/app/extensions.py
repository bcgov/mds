from flask_caching import Cache
from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate, MigrateCommand
from flask import current_app

from .config import Config
from .helper import Api

db = SQLAlchemy()
migrate = Migrate()
jwt = JwtManager()
cache = Cache()

api = Api(
    prefix=f'{Config.BASE_PATH}',
    doc=f'{Config.BASE_PATH}/',
    default='document_manager',
    default_label='Document storage and management')
