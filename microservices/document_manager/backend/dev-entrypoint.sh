#!/usr/bin/env bash

sleep 30
flask db upgrade
flask run