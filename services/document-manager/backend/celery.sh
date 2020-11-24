#!/bin/bash

cd /app

celery worker -A app.tasks.celery --detach --loglevel=info --logfile=/tmp/celery/celery.log --pidfile=/tmp/celery/celery.pid --concurrency=1

celery flower -A app.tasks.celery
