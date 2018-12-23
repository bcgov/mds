#!/bin/bash

for file in ${NGINX_CONFIGURATION_PATH}/*
filename=$(basename $file)
do
  envsubst < $file > /tmp/$filename
  mv /tmp/$filename $file
done

for file in ${NGINX_DEFAULT_CONF_PATH}/*
filename=$(basename $file)
do
  envsubst < $file > /tmp/$filename
  mv /tmp/$filename $file
done

envsubst < ${NGINX_CONF_PATH} > /tmp/nginx.conf
mv /tmp/nginx.conf ${NGINX_CONF_PATH}

rm -rf /tmp/*