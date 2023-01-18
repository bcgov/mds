#!/bin/bash

diff -r -C 5 services/core-web/common services/minespace-web/common

if [ $? != 0 ]
then 
echo "'/services/core-web/common' does not match '/services/minespace-web/common'"
exit 1
fi