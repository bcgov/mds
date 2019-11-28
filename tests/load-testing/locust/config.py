import os

from dotenv import load_dotenv, find_dotenv

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

class Config(object):
    # Environment config
    BEARER_TOKEN = os.environ.get('BEARER_TOKEN', '')
    MINE_GUID = os.environ.get('MINE_GUID', '')