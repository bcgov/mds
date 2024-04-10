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

class ExplosivesPermitDocumentException(MineException):
    """Exception for Explosives Permit Document Related Exception"""

    description = (
        "Exception For Explosives Permit Document Related Errors"
    )
    def __init__(self, message = "An error occurred while processing Explosives Permit Document", **kwargs):
        super().__init__(message, **kwargs)
        self.code = int(kwargs.get("status_code", 500))

class ExplosivesPermitException(MineException):
    """Exception for Explosive Permit related errors"""

    description = (
        "Exception for errors in Explosive Permit"
    )
    def __init__(self, message = "Error in Explosive Permit", **kwargs):
        super().__init__(message, **kwargs)
        self.code = int(kwargs.get("status_code", 500))

class ExplosivePermitNumberAlreadyExistExeption(MineException):
    """Exception for already existing permit number"""

    description = (
        "Exception for already existing permit number"
    )
    def __init__(self, message = "A record already exists with the provided 'Explosives Permit Number'", **kwargs):
        super().__init__(message, **kwargs)
        self.code = int(kwargs.get("status_code", 422))

class MineReportProcessingException(MineException):
    """Exception for Mine report related exception"""

    description = (
        "Exception for Mine report related exception"
    )
    def __init__(self, message = "Error in processing the Mine Report", **kwargs):
        super().__init__(message, **kwargs)
        self.code = int(kwargs.get("status_code", 422))
