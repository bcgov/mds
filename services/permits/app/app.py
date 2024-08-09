import logging
import os

from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI

from .openid_connect_middleware import OpenIdConnectMiddleware
from .permit_conditions.resources.permit_condition_resource import (
    router as permit_condition_router,
)
from .permit_search.resources.permit_search_resource import (
    router as permit_search_router,
)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "False").lower() == "true"


logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s", level=logging.INFO
)

mds = FastAPI()
mds.include_router(permit_condition_router)
mds.include_router(permit_search_router)

if DEBUG_MODE:
    if not os.path.exists("debug"):
        os.makedirs("debug")

# mds.add_middleware(OpenIdConnectMiddleware)
