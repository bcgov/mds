import os
import traceback


def opt_env(var_name):
    try:
        return os.environ[var_name]
    except KeyError:
        return None

# Print stack trace if a worker is killed (e.g. from a timeout)
def worker_abort(worker):
    print(dir(worker))
    pid = worker.pid
    print("worker is being killed - {}".format(pid))
    traceback.print_stack()

bind = "0.0.0.0:5000"
timeout = opt_env("GUNICORN_TIMEOUT") or 125
workers = opt_env("GUNICORN_WORKERS") or 3
errorlog = opt_env("GUNICORN_ERROR_LOG") or "-"
loglevel = opt_env("GUNICORN_LOG_LEVEL") or "debug"
accesslog = opt_env("GUNICORN_ACCESS_LOG") or "-"
