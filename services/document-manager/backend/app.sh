#!/bin/bash
# next line works for couple of minutes and then pod gets killed: Crash Loop Back-off
# celery worker -A app.tasks.celery --detach --loglevel=info --concurrency=1

uwsgi uwsgi.ini

python celery_start.py
