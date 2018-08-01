FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

RUN curl -sLo ${APP_ROOT}/src/package.json ${NODE_REQUIREMENTS_URL}

RUN cd ${APP_ROOT}/src && npm install
