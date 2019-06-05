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
            client = None
            if current_app:
                client = Client(current_app.config['ELASTIC_APM'])
            elif sched.app:
                client = Client(
                    sched.app.app_context().app.config['ELASTIC_APM'])

            _name = name if name is not None else func.__name__

            # ensure client was created properly
            if client:
                client.begin_transaction('registered_funcs')
                try:
                    func(*args, **kwargs)
                    client.end_transaction(f'{_name} - success')
                except Exception as e:
                    client.capture_exception()
                    client.end_transaction(f'{_name} - error')
                    raise e
            else:
                print(
                    f'could not create ElasticAPM client... running <{_name}> without APM')
                func(*args, **kwargs)
        return wrapped_f

    return wrap
