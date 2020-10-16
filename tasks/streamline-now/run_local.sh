#!/bin/sh

# oc login
# oc login https://console.pathfinder.gov.bc.ca:8443 --token=vmys89BF43q1lVJ2wCiPJtAhYOSqU_63nZv05EF-tcw

# oc project empr-mds-dev
# oc port-forward mds-postgresql-pr-1062-1-m245b 15432:5432


#  docker network create -d bridge --subnet 10.0.0.0/24 --gateway 10.0.0.1 mynet
 docker build -t now_etls . && docker run --env-file .env --net=mynet now_etls 
