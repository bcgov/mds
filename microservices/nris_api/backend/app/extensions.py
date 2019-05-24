import cx_Oracle
from flask_caching import Cache
from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler
from flask_migrate import Migrate, MigrateCommand
from flask import current_app
from elasticapm.contrib.flask import ElasticAPM

from .config import Config
from .helper import Api

apm = ElasticAPM()
db = SQLAlchemy()
migrate = Migrate()
jwt = JwtManager()
sched = APScheduler()

api = Api(
    prefix=f'{Config.BASE_PATH}',
    doc=f'{Config.BASE_PATH}/',
    default='nris_api',
    default_label='NRIS related operations')

try:
    dsn_tns = cx_Oracle.makedsn(
        Config.NRIS_DB_HOSTNAME, Config.NRIS_DB_PORT, service_name=Config.NRIS_DB_SERVICENAME)
    oracle_db = cx_Oracle.connect(
        user=Config.NRIS_DB_USER, password=Config.NRIS_DB_PASSWORD, dsn=dsn_tns)
except cx_Oracle.DatabaseError as e:
    oracle_db = None
