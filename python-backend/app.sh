#!/bin/bash

echo -----------------------------test-------------------------------
echo app.env ${app.env}
echo vars ${vars.deployment.env}
flask create_data 4
flask run