from app.extensions import sched
from elasticapm import Client


def register_apm(func):
    def wrapper(*args, **kwargs):
        client = Client(sched.app.app_context().app.config['ELASTIC_APM'])
        #sched.app works in both sched and flask runtimes
        client.begin_transaction('registered_funcs')
        try:
            func(*args, **kwargs)
            client.end_transaction(f'{func.__name__} - finished with no errors')
        except Exception as e:
            client.end_transaction(f'{func.__name__} - finished with error {e.__class__.__name__}')
            raise e

    return wrapper
