# Load Testing

This directory contains scripts for running load tests. The framework we are
using is called Locust, which is an open source program written in Python. It's
very simple to setup and get going, which is the main reason why we chose it.

## Setup

1. Install requirements: `pip install -r requirements.txt`
2. Create a `./locust/.env` from `./locust/.env-example`
3. Log into CORE to retrieve a bearer token. Place the token in `.env`. This
   process must be repeated when the token expires.

## Running

Backend tests: `make testbe`
Frontend tests: `yarn test`
