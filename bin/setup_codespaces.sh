#!/bin/bash

yes yes | make env
yarn
make be
make seeddb