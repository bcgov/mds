#!/bin/bash

yes yes | make env
nvm install
sudo apt-get update
sudo apt-get install libxtst6
yarn
make be
make seeddb