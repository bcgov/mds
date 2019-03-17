from flask_caching import Cache
from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from flask_restplus import Api as BaseApi
from flask_apscheduler import APScheduler

from elasticapm.contrib.flask import ElasticAPM

from .config import Config

apm = ElasticAPM()
db = SQLAlchemy()
jwt = JwtManager()
cache = Cache()
sched = APScheduler()


class Api(BaseApi):

    def _register_doc(self, app_or_blueprint):
        # HINT: This is just a copy of the original implementation with the last line commented out.
        if self._add_specs and self._doc:
            # Register documentation before root if enabled
            app_or_blueprint.add_url_rule(self._doc, 'doc', self.render_doc)
        #app_or_blueprint.add_url_rule(self._doc, 'root', self.render_root)

    @property
    def base_path(self):
        return ''


api = Api(
    prefix=Config.BASE_PATH,
    doc='{}/'.format(Config.BASE_PATH),
    default='mds',
    default_label='MDS related operations')
