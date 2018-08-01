FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

RUN set -x && \
    curl -sLo ${APP_ROOT}/src/package.json ${NODE_REQUIREMENTS_URL} && \
    cd ${APP_ROOT}/src && npm i
