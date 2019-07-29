from elasticapm import Client
from flask import current_app


def register_apm(func):
    """This function wraps a passed function with a call to the app's registered Elastic APM instance

    :param func: Function to be wrapped by calling
    :type func: func
    :raises e: Client connection exception.
    :return: Wrapped function
    :rtype: func
    """

    def wrapper(*args, **kwargs):
        result = None

        config = current_app.config['ELASTIC_APM']
        apm_enabled = str(current_app.config['ELASTIC_ENABLED']) == '1'
        if apm_enabled:
            client = Client(config)
            client.begin_transaction('registered_funcs')
            try:
                result = func(*args, **kwargs)
                client.end_transaction(f'{func.__name__} - success')
            except Exception as e:
                client.capture_exception()
                client.end_transaction(f'{func.__name__} - error')
                raise e
        else:
            result = func(*args, **kwargs)
        return result

    return wrapper