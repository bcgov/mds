#!/usr/bin/env bash

sleep 10
flask db upgrade

#keep trying until success
while [ $? -ne  0 ]
do 
flask db upgrade
done

flask run