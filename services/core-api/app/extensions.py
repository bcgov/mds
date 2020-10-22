import logging

from flask_caching import Cache
from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from elasticapm.contrib.flask import ElasticAPM

from .config import Config
from .helper import Api

apm = ElasticAPM(logging=logging.WARNING)
db = SQLAlchemy()
jwt = JwtManager()
cache = Cache()
api = Api(
    prefix='{}'.format(Config.BASE_PATH),
    doc='{}/'.format(Config.BASE_PATH),
    default='mds',
    default_label='MDS related operations')

if Config.FLASK_LOGGING_LEVEL == 'DEBUG':
    # Have engine logs included at INFO level when pod debug set to DEBUG
    logging.basicConfig()
    logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
