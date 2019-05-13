#!/bin/bash

flask db upgrade

uwsgi uwsgi.ini

tail -f /dev/null