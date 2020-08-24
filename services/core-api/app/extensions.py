import logging

from flask_caching import Cache
from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy

from flask_opentracing import FlaskTracing

from .config import Config
from .helper import Api

db = SQLAlchemy()
jwt = JwtManager()
cache = Cache()
api = Api(
    prefix='{}'.format(Config.BASE_PATH),
    doc='{}/'.format(Config.BASE_PATH),
    default='mds',
    default_label='MDS related operations')

tracer = Config.JAEGER_CONFIG.initialize_tracer()
flask_tracing = FlaskTracing(tracer)
