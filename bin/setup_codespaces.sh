#!/bin/bash

yes yes | make env
nvm install
yarn
make be
make seeddb