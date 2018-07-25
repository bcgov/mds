import os

from flask import Flask
from flask_cors import CORS
from flask_restplus import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine

# DB_URL = 'postgresql://test:test@postgres:5432/testdb'

app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
db = SQLAlchemy(app)
api = Api(app)
cors = CORS(app)

@api.route('/hello')
class Hello(Resource):
    def get(self):
        try:
            # db.engine.connect()
            return {'msg': 'hello world!'}
        except:
            return {'error': 'Cannot establish connection to db'}


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port='5000')