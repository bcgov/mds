from flask import url_for
from flask_caching import Cache
from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from flask_restplus import Api
from flask_apscheduler import APScheduler

from elasticapm.contrib.flask import ElasticAPM

from .config import Config

apm = ElasticAPM()
db = SQLAlchemy()
jwt = JwtManager()
cache = Cache()
sched = APScheduler()


class MyApi(Api):
    @property
    def specs_url(self):
        """Monkey patch for HTTPS"""
        scheme = 'http' if '5000' in self.base_url else 'https'
        return url_for(self.endpoint('specs'), _external=True, _scheme=scheme)


api = MyApi(
    prefix='{}'.format(Config.BASE_PATH),
    doc='{}/'.format(Config.BASE_PATH),
    default='mds',
    default_label='MDS related operations')
