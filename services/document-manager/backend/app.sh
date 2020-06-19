#!/bin/bash

# Option 1: uWSGI
#uwsgi uwsgi.ini

# Option 2: gunicorn
gunicorn 'app:create_app()' --config gunicorn.conf.py

# Option 3: flask
#flask run