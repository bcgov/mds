import os

from dotenv import load_dotenv, find_dotenv


ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    DB_HOST = os.environ.get('DB_HOST', '')
    DB_USER = os.environ.get('DB_USER', '')
    DB_PASS = os.environ.get('DB_PASS', '')
    DB_PORT = os.environ.get('DB_PORT', '')
    DB_NAME = os.environ.get('DB_NAME', '')
    DB_URL = "postgresql://{0}:{1}@{2}:{3}/{4}".format(DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME)