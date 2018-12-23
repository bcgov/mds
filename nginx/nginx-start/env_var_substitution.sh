#!/bin/bash

for file in ${NGINX_CONFIGURATION_PATH}/*
do
  filename=$(basename $file)
  envsubst < $file > /tmp/$filename
  chmod a+rw /tmp/$filename
  mv /tmp/$filename $file
done

for file in ${NGINX_DEFAULT_CONF_PATH}/*
do
  filename=$(basename $file)
  envsubst < $file > /tmp/$filename
  chmod a+rw /tmp/$filename
  mv /tmp/$filename $file
done

envsubst < ${NGINX_CONF_PATH} > /tmp/nginx.conf
chmod a+rw /tmp/nginx.conf
mv /tmp/nginx.conf ${NGINX_CONF_PATH}

rm -rf /tmp/*