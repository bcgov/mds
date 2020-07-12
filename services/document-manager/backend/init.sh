#!/bin/sh

celery worker -A app.utils.tasks --detach --loglevel info --logfile=celery.log --pidfile=celeryd.pid
flask run
