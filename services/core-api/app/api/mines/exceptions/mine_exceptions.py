import json
from app.api.exception.mds_core_api_exceptions import MDSCoreAPIException

class MineException(MDSCoreAPIException):
    """A Custom Exception for MINE API Module Erros"""

    description = (
        "Exeption occurred in the Mine module"
    )
    def __init__(self, message, **kwargs):
        super().__init__(message, **kwargs)
        self.code = int(kwargs.get("status_code", 500))

class InvalidInputDataException(MineException):
    """Exception for invalid data in the input params/body"""

    description = (
        "Exception occurred due to the input data"
    )
    def __init__(self, message, **kwargs):
        super().__init__(message, **kwargs)
        self.code = int(kwargs.get("status_code", 422))
