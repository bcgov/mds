#!/bin/bash
# TODO: this is the location for codespaces, work to handle outside of codespaces which should be . ~/.nvm/nvm.sh
. ~/nvm/nvm.sh

echo "+\n++ Assign Node Version ...\n+"
nvm use 
node -v
make be &
cd services/common && yarn watch &
cd services/core-web && yarn serve &
cd services/minespace-web && yarn serve