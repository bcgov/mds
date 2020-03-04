from flask_caching import Cache
from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from elasticapm.contrib.flask import ElasticAPM

from .config import Config
from .helper import Api

apm = ElasticAPM()
db = SQLAlchemy()
jwt = JwtManager()
cache = Cache()
api = Api(
    prefix='{}'.format(Config.BASE_PATH),
    doc='{}/'.format(Config.BASE_PATH),
    default='mds',
    default_label='MDS related operations')

# config = Config(
#     config={ # TODO: Read from from some yaml config
#         'sampler': {
#             'type': 'const',
#             'param': 1,
#         },
#         'local_agent': {
#             'reporting_host': 'jaeger' #TODO: Read from config
#             'reporting_port': '5775'
#         }
#         'logging': True,
#     },
#     service_name='core-api',
#     validate=True,
# )
