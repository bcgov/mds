from pathlib import Path

from celery import bootsteps
from celery.signals import worker_ready, worker_shutdown

LIVENESS_FILE = Path("/tmp/liveness_check")
READINESS_FILE = Path("/tmp/readiness_check")


class HealthCheckProbe(bootsteps.StartStopStep):
    """
    Probe that can be used to determine liveness and readiness status
    of the given Celery worker.

    Creates /tmp/readiness_check when the worker starts up
    Updated /tmp/liveness_check every 1s as long as the worker is running.

    These files can be read by any monitoring scripts to determine whether or not 
    the celery worker is running.

    This solution is heavily inspired by https://github.com/celery/celery/issues/4079
    and is inteded as a replacement for `celery inspect` which causes high CPU usage
    and pod restarts. https://bcmines.atlassian.net/browse/MDS-5300
    """

    requires = {'celery.worker.components:Timer'}

    def __init__(self, worker, **kwargs):
        self.requests = []
        self.tref = None

    def start(self, worker):
        # Update liveness file every second
        self.tref = worker.timer.call_repeatedly(
            1.0, self.update_liveness_file, (worker,), priority=10,
        )

    def stop(self, worker):
        LIVENESS_FILE.unlink(missing_ok=True)

    def update_liveness_file(self, worker):
        LIVENESS_FILE.touch()


@worker_ready.connect
def worker_ready(**_):
    READINESS_FILE.touch()


@worker_shutdown.connect
def worker_shutdown(**_):
    READINESS_FILE.unlink(missing_ok=True)
