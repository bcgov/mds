import json
from app.api.exception.mds_core_api_exceptions import MDSCoreAPIException

class MineException(MDSCoreAPIException):
    """A Custom Exception for Errors in MINE Namespace"""

    description = (
        "Generic exeption for errors occurred in the Mine module"
    )
    def __init__(self, message = "Oops! Something went wrong", **kwargs):
        super().__init__(message, **kwargs)
        self.code = int(kwargs.get("status_code", 500))

