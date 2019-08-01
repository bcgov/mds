from elasticapm import Client
from flask import current_app


def register_apm(name=None):
    """This function wraps a passed function with a call to the app's registered Elastic APM instance

    :param func: Function to be wrapped by calling 
    :type func: func
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
                apm_enabled = str(current_app.config['ELASTIC_ENABLED']) == '1'
            elif sched.app:
                config = sched.app.app_context().app.config['ELASTIC_APM']
                apm_enabled = str(sched.app.app_context().app.config['ELASTIC_ENABLED']) == '1'

            _name = name if name is not None else func.__name__

            if apm_enabled:
                client = Client(config)
                if client:
                    client.begin_transaction('registered_funcs')
                    try:
                        result = func(*args, **kwargs)
                        client.end_transaction(f'{_name} - success')
                    except Exception as e:
                        client.capture_exception()
                        client.end_transaction(f'{_name} - error')
                        raise e
                else:
                    print(f'could not create ElasticAPM client... running <{_name}> without APM')
                    result = func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            return result

        return wrapped_f

    return wrap
