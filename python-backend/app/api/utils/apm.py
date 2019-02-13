from app.extensions import sched
from elasticapm import Client
from flask import current_app


def register_apm(func):
    def wrapper(*args, **kwargs):
        client = None
        if current_app:
            client = Client(current_app.config['ELASTIC_APM'])
        elif sched.app:
            client = Client(sched.app.app_context().app.config['ELASTIC_APM'])

        #ensure client was created properly
        if client:
            client.begin_transaction('registered_funcs')
            try:
                func(*args, **kwargs)
                client.end_transaction(f'{func.__name__} - success')
            except Exception as e:
                client.capture_exception()
                client.end_transaction(f'{func.__name__} - error')
                raise e
        else:
            print(f'could not create ElasticAPM client... running <{func.__name__}> without APM')
            func(*args, **kwargs)

    return wrapper
