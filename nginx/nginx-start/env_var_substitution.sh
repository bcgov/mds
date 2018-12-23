#!/bin/bash

for file in ${NGINX_CONFIGURATION_PATH}/*
do
  envsubst < $file > /tmp/$file
  mv /tmp/$file $file
done

for file in ${NGINX_DEFAULT_CONF_PATH}/*
do
  envsubst < $file > /tmp/$file
  mv /tmp/$file $file
done

envsubst < ${NGINX_CONF_PATH} > /tmp/${NGINX_CONF_PATH}
mv /tmp/${NGINX_CONF_PATH} ${NGINX_CONF_PATH}

rm -rf /tmp/*