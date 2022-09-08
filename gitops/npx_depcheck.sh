#!/bin/bash

set -e


depcheck $1


echo "::set-output name=DEPCHECK_OUTPUT::$?"
