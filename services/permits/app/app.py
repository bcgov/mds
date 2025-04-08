import logging
import os

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from .openid_connect_middleware import OpenIdConnectMiddleware
from .pipelines.permit_condition_extraction.resources.permit_condition_resource import (
    router as permit_condition_router,
)
from .pipelines.permit_condition_search.resources.permit_condition_search_resource import (
    router as permit_condition_search_router,
)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"


logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s", level=logging.DEBUG
)

mds = FastAPI()
mds.include_router(permit_condition_router)
mds.include_router(permit_condition_search_router)

if DEBUG_MODE:
    if not os.path.exists("debug"):
        os.makedirs("debug")
    if not os.path.exists("app/cache"):
        os.makedirs("app/cache")

mds.add_middleware(OpenIdConnectMiddleware)

origins = [
    "http://localhost:8004",
    "http://localhost:80",
    "https://*.apps.silver.devops.gov.bc.ca"
]

mds.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
