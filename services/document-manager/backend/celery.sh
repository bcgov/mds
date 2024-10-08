#!/bin/bash

cd /app

celery -A app.tasks.celery worker --loglevel=info --logfile=/tmp/celery/celery.log --pidfile=/tmp/celery/celery.pid --concurrency=1 -n doc_man@%h

celery -A app.tasks.celery flower --detach --basic_auth=${FLOWER_USER}:${FLOWER_USER_PASSWORD}