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


cd /app || exit

celery worker -n core_tasks@%h -A app.tasks.celery_entrypoint -Q core_tasks --loglevel=debug --concurrency=1 -B --scheduler redbeat.RedBeatScheduler -E --pidfile /tmp/celerybeat.pid -s /tmp/celerybeat-schedule
