from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from flask_restplus import Api

from .config import Config

db = SQLAlchemy()
jwt = JwtManager()
api = Api(prefix=Config.BASE_PATH, doc='{}/'.format(Config.BASE_PATH))
