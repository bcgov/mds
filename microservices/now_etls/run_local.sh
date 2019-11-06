#!/bin/sh

# oc login

oc project empr-mds-dev
oc port-forward mds-postgresql-pr-1062-1-7f87f 15432:5432

docker build -t now_etls . && docker run now_etls \
  -e DB_HOST=localhost \
  -e DB_PORT=15432 \
  -e DB_USER=mds \
  -e DB_PASS=${FILLME} \
  -e DB_NAME=mds
