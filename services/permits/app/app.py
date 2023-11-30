from typing import Union

from fastapi import FastAPI

from rest_api.utils import get_app

mds = FastAPI()

haystack_app = get_app()

mds.mount('/haystack', haystack_app)

@mds.get("/")
def read_root():
    return {"Hello": "World"}
