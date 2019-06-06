from app.extensions import sched
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
        config = None
        result = None
        if current_app:
            config = current_app.config['ELASTIC_APM']
            apm_enabled = current_app.config['ELASTIC_ENABLED']
        elif sched.app:
            config = sched.app.app_context().app.config['ELASTIC_APM']
            apm_enabled = sched.app.app_context().app.config['ELASTIC_ENABLED']

        client = Client(config)
        if client and apm_enabled:
            client.begin_transaction('registered_funcs')
            try:
                result = func(*args, **kwargs)
                client.end_transaction(f'{func.__name__} - success')
            except Exception as e:
                client.capture_exception()
                client.end_transaction(f'{func.__name__} - error')
                raise e
        else:
            print(f'Running <{func.__name__}> without APM')
            result = func(*args, **kwargs)
        return result

    return wrapper