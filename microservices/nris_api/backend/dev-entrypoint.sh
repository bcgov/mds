#!/usr/bin/env bash

sleep 5
flask db upgrade

#keep trying until success
while [ $? -ne  0 ]
do 
flask db upgrade
done

flask run