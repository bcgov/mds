from app.extensions import sched
from elasticapm import Client
from flask import current_app


def register_apm(name=None):
    """This decorator wraps a passed function with a call to the app's registered Elastic APM instance

    :param object: Function to be wrapped and decorator parameters by calling 
    :type object: object
    :raises e: Client connection exception.
    :return: Wrapped function
    :rtype: func
    """

    def wrap(func):
        def wrapped_f(*args, **kwargs):
            config = None
            result = None
            if current_app:
                config = current_app.config['ELASTIC_APM']
                apm_enabled = current_app.config['ELASTIC_ENABLED']
            elif sched.app:
                config = sched.app.app_context().app.config['ELASTIC_APM']
                apm_enabled = sched.app.app_context().app.config['ELASTIC_ENABLED']

            _name = name if name is not None else func.__name__

            client = Client(config)
            if client and apm_enabled:
                client.begin_transaction('registered_funcs')
                try:
                    result = func(*args, **kwargs)
                    client.end_transaction(f'{_name} - success')
                except Exception as e:
                    client.capture_exception()
                    client.end_transaction(f'{_name} - error')
                    raise e
            else:
                print(f'Running <{_name}> without APM')
                result = func(*args, **kwargs)
            return result

        return wrapped_f

    return wrap
