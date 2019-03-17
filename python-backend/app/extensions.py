from flask_caching import Cache
from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler

from elasticapm.contrib.flask import ElasticAPM

from .config import Config
from .helper import Api

apm = ElasticAPM()
db = SQLAlchemy()
jwt = JwtManager()
cache = Cache()
sched = APScheduler()
api = Api(
    prefix='{}'.format(Config.BASE_PATH),
    doc='{}/'.format(Config.BASE_PATH),
    default='mds',
    default_label='MDS related operations')
