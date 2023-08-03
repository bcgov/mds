#!/bin/bash

cd /app

celery -A app.tasks.celery worker --detach --loglevel=info --logfile=/tmp/celery/celery.log --pidfile=/tmp/celery/celery.pid --concurrency=1

celery -A app.tasks.celery flower --basic_auth=${FLOWER_USER}:${FLOWER_USER_PASSWORD}