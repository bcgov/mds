from flask_caching import Cache
from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from flask_uploads import UploadSet, AllExcept, EXECUTABLES, SCRIPTS
from flask_restplus import Api

from .config import Config

db = SQLAlchemy()
jwt = JwtManager()
cache = Cache()
api = Api(prefix=Config.BASE_PATH, doc='{}/'.format(Config.BASE_PATH),
          default='mds', default_label='MDS related operations')

documents = UploadSet('document', AllExcept(EXECUTABLES + SCRIPTS))