#!/usr/bin/env bash

curl -sLo /tmp/sonar-scanner-cli.zip https://sonarsource.bintray.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-3.2.0.1227-linux.zip && \
    mkdir ${APP_ROOT}/sonar-scanner-cli && unzip -q /tmp/sonar-scanner-cli.zip -d ${APP_ROOT}/sonar-scanner-cli && \
    mv ${APP_ROOT}/sonar-scanner-cli ${APP_ROOT}/_sonar-scanner-cli && mv ${APP_ROOT}/_sonar-scanner-cli/sonar-scanner-3.2.0.1227-linux ${APP_ROOT}/sonar-scanner-cli && \
    rm -rf ${APP_ROOT}/_sonar-scanner-cli \
    rm /tmp/sonar-scanner-cli.zip && \
    chmod -R 755 ${APP_ROOT}/sonar-scanner-cli 

#DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

#cd $DIR
cd ${APP_ROOT}/src

#S2I removes "unecessary" development dependencies
npm install

#Run tests with coverage report
npm run-script coverage

#Upload code with coverage report
/opt/app-root/sonar-scanner-cli/bin/sonar-scanner "-Dsonar.host.url=${SONAR_HOST_URL}"

