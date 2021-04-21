#!/bin/bash

if ! oc whoami
then
    echo
    echo "Please obtain an OpenShift API token.  A window will open shortly."
    sleep 3
    open https://console.pathfinder.gov.bc.ca:8443/oauth/token/request
    exit
fi

docker login -u $(oc whoami) -p $(oc whoami -t) https://docker-registry.pathfinder.gov.bc.ca/