from sqlalchemy.exc import SQLAlchemyError, DBAPIError
from werkzeug.exceptions import InternalServerError


class SQLAlchemyErrorWrapper(Exception):
    """Wraps SQLAlchemy Errors for global error handling"""

    def __init__(self, error):
        error_name = error.__class__.__name__
        self.error_to_throw = None

        def _check_all_error_classes(classname, name):
            for subclass in classname.__subclasses__():
                if self.error_to_throw != None:
                    break

                if str(subclass.__name__) == error_name:
                    self.error_to_throw = subclass

                if len(subclass.__subclasses__()) != 0:
                    _check_all_error_classes(subclass, name)

        # Recursively check all subclasses of the base SQLAlchemy errors
        _check_all_error_classes(SQLAlchemyError, error_name)
        _check_all_error_classes(DBAPIError, error_name)
        if self.error_to_throw != None:
            raise self.error_to_throw(error.statement, error.params, error.orig)
        else:
            raise InternalServerError('Unknown database error.')
