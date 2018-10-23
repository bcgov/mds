from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy
from flask_restplus import Api

db = SQLAlchemy()
jwt = JwtManager()
api = Api()