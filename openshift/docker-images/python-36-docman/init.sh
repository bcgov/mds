#!/bin/sh

mkdir -p /var/log/celery /var/run/celery
celery worker -A app.utils.tasks --detach --loglevel=info --logfile=/var/log/celery/celery.log --pidfile=/var/run/celery/celery.pid --concurrency=8