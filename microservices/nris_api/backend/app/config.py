import os

from dotenv import load_dotenv, find_dotenv


class Config(object):
    # Environment config
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    BASE_PATH = os.environ.get('BASE_PATH', '')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_USER = os.environ.get('DB_USER', 'user')
    DB_PASS = os.environ.get('DB_PASS', 'pass')
    DB_PORT = os.environ.get('DB_PORT', 5432)
    DB_NAME = os.environ.get('DB_NAME', 'db_name')
    DB_URL = f"postgres://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    SQLALCHEMY_DATABASE_URI = DB_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = True

    NRIS_DB_USER = os.environ.get('NRIS_DB_USER', 'localhost')
    NRIS_DB_PASSWORD = os.environ.get('NRIS_DB_PASSWORD', 'localhost')
    NRIS_DB_CONNECT = os.environ.get('NRIS_DB_CONNECT', 'localhost')
    NRIS_DB_PORT = os.environ.get('NRIS_DB_PORT', 'localhost')
    NRIS_DB_SERVICENAME = os.environ.get('NRIS_DB_SERVICENAME', 'localhost')
    NRIS_DB_HOSTNAME = os.environ.get('NRIS_DB_HOSTNAME', 'localhost')