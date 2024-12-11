#!/bin/bash

# This script is used to start the Celery worker in development mode with auto-reload on file changes.
# The production entrypoint can be found in celery.sh
# -n is the number of tasks to consume
# -A is the name of the app to run
# -Q is the name of the queue to consume from
# -concurrency is the number of child processes processing the queue
# -B is the Beat
# --scheduler is the scheduler class to use
# -s Path to the schedule database.
# -E Enable sending task-related events that can be captured by monitors
# --pidfile is the location of the pid file


cd /app || exit

watchmedo auto-restart --directory=./ --pattern=*.py --recursive -- celery -A app.tasks.celery_entrypoint worker -n core_tasks@%h -Q core_tasks --loglevel=${CELERY_LOG_LEVEL:-info} --concurrency=1 -B --scheduler redbeat.RedBeatScheduler -E
