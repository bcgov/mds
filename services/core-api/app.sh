#!/bin/bash

# Run the app with 3 workers and a request timeout of 200 seconds
gunicorn -w 3  --timeout 200 --access-logfile - --error-logfile - --log-level debug --capture-output 'app:create_app()' -b 0.0.0.0:5000 -c app/gunicorn_config.py
