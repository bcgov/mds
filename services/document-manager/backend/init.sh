#!/bin/sh

cd /app
celery worker -A app.utils.tasks --detach --loglevel=info --logfile=/var/log/celery/celery.log --pidfile=/var/run/celery/celery.pid --concurrency=1
flask run
