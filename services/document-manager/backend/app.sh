#!/bin/bash

cd /app
celery worker -A app.tasks.celery --detach --loglevel=info --logfile=/var/log/celery/celery.log --pidfile=/var/run/celery/celery.pid --concurrency=1

uwsgi ../uwsgi.ini
