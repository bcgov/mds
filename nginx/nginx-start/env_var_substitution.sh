#!/bin/bash

for file in /etc/nginx/conf.d/*
do
  envsubst < /etc/nginx/conf.d/$file > /etc/nginx/conf.d/$file
done

for file in /etc/nginx/nginx.default.d/*
do
  envsubst < /etc/nginx/nginx.default.d/$file > /etc/nginx/nginx.default.d/$file
done

envsubst < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf