#!/bin/bash

if(($DEPLOYMENT_ENVIRONMENT == "dev") || ($DEPLOYMENT_ENVIRONMENT == "test")) 
then flask create_data 100
fi

uwsgi uwsgi.ini