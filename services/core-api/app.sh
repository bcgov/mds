#!/bin/bash

# Run the app with 3 workers and a request timeout of 200 seconds
gunicorn -c app/gunicorn_config.py 'app:create_app()'  
