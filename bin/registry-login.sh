#!/bin/bash
#========================================================================#
# Openshift Image Registry Login
# Synopsis: Script to log into OCP image registry so developers can access imagestream objects
#========================================================================#
if ! oc whoami
then
    echo
    echo "Please obtain an OpenShift API token by following this link"
    echo "https://oauth-openshift.apps.silver.devops.gov.bc.ca/oauth/token/request"
    exit
fi

oc registry login