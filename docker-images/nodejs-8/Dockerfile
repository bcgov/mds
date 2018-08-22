FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# Install OS dependencies for NPM build success
USER 0
RUN yum install -y nasm libtool autoconf automake cairo-devel \
cairo libpng giflib libX11 libX11-devel libXt libXt-devel libgif-dev \
libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel \
libxml2-devel libpng-devel freetype freetype-devel libart_lgpl-devel \
libcairo2-dev libjpeg8-dev libpango1.0-dev build-essential g++

USER 1001

# Install sonar-scanner
RUN curl -sLo /tmp/sonar-scanner-cli.zip https://sonarsource.bintray.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-3.2.0.1227-linux.zip && \
    mkdir ${APP_ROOT}/sonar-scanner-cli && unzip -q /tmp/sonar-scanner-cli.zip -d ${APP_ROOT}/sonar-scanner-cli && \
    mv ${APP_ROOT}/sonar-scanner-cli ${APP_ROOT}/_sonar-scanner-cli && mv ${APP_ROOT}/_sonar-scanner-cli/sonar-scanner-3.2.0.1227-linux ${APP_ROOT}/sonar-scanner-cli && \
    rm -rf ${APP_ROOT}/_sonar-scanner-cli \
    rm /tmp/sonar-scanner-cli.zip && \
    chmod -R 755 ${APP_ROOT}/sonar-scanner-cli

# Install project dependencies
COPY package.json ${APP_ROOT}/src
COPY package-lock.json ${APP_ROOT}/src
RUN source ${APP_ROOT}/etc/scl_enable && cd ${APP_ROOT}/src && env CC=/opt/rh/devtoolset-2/root/usr/bin/gcc CXX=/opt/rh/devtoolset-2/root/usr/bin/g++ npm install canvas && npm install
