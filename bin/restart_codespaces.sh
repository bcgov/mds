#!/bin/bash

make be &
cd services/common && yarn watch &
cd services/core-web && yarn serve &
cd services/minespace-web && yarn serve