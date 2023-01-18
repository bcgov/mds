#!/bin/bash

cd /app

celery worker -n core_tasks@%h -A app.tasks.celery_entrypoint -Q core_tasks --loglevel=debug --concurrency=1 -B --scheduler redbeat.RedBeatScheduler -E
