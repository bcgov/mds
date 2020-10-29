#!/bin/sh

cd /app
# celery worker -A app.tasks.celery --detach --loglevel=info --logfile=/var/log/celery/celery.log --pidfile=/var/run/celery/celery.pid --concurrency=1
flask run

#celery worker -A app.tasks.celery --loglevel=info --concurrency=1