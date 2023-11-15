class MDSCoreAPIException(Exception):
    """A base Exception class for MDS Core API"""

    description = (
        "Exception occurred in MDS Core API"
    )

    def __init__(self, message, **kwargs):
        super().__init__(message)
        self.code = int(kwargs.get("status_code", 500))
        self.message = message
        self.detailed_error = kwargs.get("detailed_error", "")
