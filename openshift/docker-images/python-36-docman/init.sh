#!/bin/sh

cd /opt/app-root/src
celery worker -A app.utils.tasks --detach --loglevel=info --logfile=celery.log --pidfile=celery.pid --concurrency=1
