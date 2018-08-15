from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
jwt = JwtManager()
