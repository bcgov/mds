import rest_api.utils
from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI
from rest_api.utils import get_app

from .openid_connect_middleware import OpenIdConnectMiddleware
from .pipelines import indexing_pipeline, query_pipeline, request_limiter, document_store

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

# Configure default query and indexing pipelines for Haystack to use
rest_api.utils.pipelines = {
    'query_pipeline': query_pipeline(),
    'document_store': document_store,
    'concurrency_limiter': request_limiter(),
    'indexing_pipeline': indexing_pipeline(),
}

mds = FastAPI()
mds.add_middleware(OpenIdConnectMiddleware)

haystack_app = get_app()
# Include the Haystack REST API in our app
mds.mount('/haystack', haystack_app)
