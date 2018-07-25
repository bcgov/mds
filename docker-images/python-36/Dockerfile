FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

RUN source /opt/app-root/etc/scl_enable && \
    set -x && \
    pip install -U pip setuptools wheel && \
    curl -sLo ${APP_ROOT}/src/requirements.txt ${PYTHON_REQUIREMENTS_URL} && \
    sha256sum "${APP_ROOT}/src/requirements.txt" > ${APP_ROOT}/requirements.sha256  && \
    cd ${APP_ROOT}/src && pip install -r requirements.txt
