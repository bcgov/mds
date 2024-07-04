from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI

from .openid_connect_middleware import OpenIdConnectMiddleware
# from .pipelines import indexing_pipeline, query_pipeline, request_limiter, document_store
from .permit_conditions.resources.permit_condition_resource import router

# Configure default query and indexing pipelines for Haystack to use
# rest_api.utils.pipelines = {
#     'query_pipeline': query_pipeline(),
#     'document_store': document_store,
#     'concurrency_limiter': request_limiter(),
#     'indexing_pipeline': indexing_pipeline(),
# }

mds = FastAPI()
mds.include_router(router)
# mds.add_middleware(OpenIdConnectMiddleware)

# mds.add_route

# haystack_app = get_app()
# # Include the Haystack REST API in our app
# mds.mount('/haystack', haystack_app)
