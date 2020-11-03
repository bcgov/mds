#!/bin/bash

# mkdir -p /var/log/celery /var/run/celery

# cat > /var/log/celery/celery.log
# cat > /var/run/celery/celery.pid

# chmod -R ugo+rwx /var/log/celery
# chmod -R ugo+rwx /var/run/celery

# cd /opt/app-root/src

celery worker -A app.tasks.celery --detach --loglevel=info --concurrency=1

uwsgi ../uwsgi.ini
