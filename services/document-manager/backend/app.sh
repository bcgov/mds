#!/bin/bash

uwsgi uwsgi.ini
#gunicorn 'app:create_app()' --config gunicorn.conf.py