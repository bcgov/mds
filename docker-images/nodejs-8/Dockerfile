FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0
RUN yum install -y nasm build-base libtool libpng-dev autoconf automake
USER 1001

RUN curl -sLo ${APP_ROOT}/src/package.json ${NODE_REQUIREMENTS_URL}

RUN source ${APP_ROOT}/etc/scl_enable && cd ${APP_ROOT}/src && npm install
