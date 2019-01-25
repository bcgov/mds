This repo contains scripts for running load tests. The framework we are using is called Locust,
which is an open source program written in Python. It's very simple to setup and get going,
which is the main reason why we chose it.

Runs on:
Python 3

To install requirements run:

'pip install -r requirements.txt'

Get a bearer token from the network console after successfully loging into the app.
Add it to the constants.py file
NOTE:  It will only last a day.


To run api tests run:


To run web tests run:
locust -f scripts/web_locust_file.py --host=http://localhost:3000

Go to localhost:8089 to run jobs.
