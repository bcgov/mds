#!/bin/bash

# -n is the number of tasks to consume
# -A is the name of the app to run
# -Q is the name of the queue to consume from
# -concurrency is the number of child processes processing the queue
# -B is the Beat
# --scheduler is the scheduler class to use
# -s Path to the schedule database.
# -E Enable sending task-related events that can be captured by monitors
# --pidfile is the location of the pid file
celery -A app.celery worker --loglevel=info -n permit_service@%h --concurrency=1 -Q permits
