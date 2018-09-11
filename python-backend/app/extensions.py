from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache

db = SQLAlchemy()
jwt = JwtManager()
cache = Cache()
