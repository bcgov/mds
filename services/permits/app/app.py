from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI
import logging

from .openid_connect_middleware import OpenIdConnectMiddleware
from .permit_conditions.resources.permit_condition_resource import router as permit_condition_router
from .permit_search.resources.permit_search_resource import router as permit_search_router

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s', level=logging.INFO)

mds = FastAPI()
mds.include_router(permit_condition_router)
mds.include_router(permit_search_router)

mds.add_middleware(OpenIdConnectMiddleware)
