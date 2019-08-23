# Load Testing

This directory contains scripts for running load tests. The framework we are
using is called Locust, which is an open source program written in Python. It's
very simple to setup and get going, which is the main reason why we chose it.

## Setup Runs on: Python 3

To install requirements run:

'pip install -r requirements.txt'

Save a copy of  '.envEXAMPLE' as '.env'

Get a bearer token from the network console after successfully logging into the
app.  Add it to the .env file.  NOTE:  It will only last a day.

## Running To run api tests run:

'make test-api-local'

To run frontend tests run:

'make test-web-local'

Go to localhost:8089 to run jobs.
