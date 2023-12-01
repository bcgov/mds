
from fastapi import FastAPI

from rest_api.utils import get_app

import rest_api.utils

from .pipelines import indexing_pipeline, query_pipeline, request_limiter, document_store

# Configure default query and indexing pipelines for Haystack to use
rest_api.utils.pipelines = {
    'query_pipeline': query_pipeline(),
    'document_store': document_store,
    'concurrency_limiter': request_limiter(),
    'indexing_pipeline': indexing_pipeline(),
}


mds = FastAPI()

haystack_app = get_app()
# Include the Haystack REST API in our app
mds.mount('/haystack', haystack_app)
