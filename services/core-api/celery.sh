#!/bin/bash

cd /app

celery worker -n core_tasks@%h -A app.tasks.celery_entrypoint -Q core_tasks --loglevel=info --pidfile=/tmp/celery/celery.pid --concurrency=1 -B -S redbeat.RedBeatScheduler -E
