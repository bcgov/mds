#!/usr/bin/env bash

sleep 20
flask db upgrade
flask run