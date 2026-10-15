#!/bin/bash

cd /app

celery -A app.tasks.celery worker --loglevel=info --pidfile=/tmp/celery/celery.pid --concurrency=1 -n document_manager_service@%h
