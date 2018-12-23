#!/bin/bash

for file in /etc/nginx/conf.d/*
do
  envsubst < $file > $file
done

for file in /etc/nginx/nginx.default.d/*
do
  envsubst < $file > $file
done

envsubst < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf